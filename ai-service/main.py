import os
import re
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ai-service")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
BACKEND_URL  = os.environ.get("BACKEND_URL", "http://backend:8080")

GROQ_MODELS = [
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "gemma2-9b-it",
]

import httpx

app = FastAPI(title="GuildGuide AI Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


# ─── Data Sources ─────────────────────────────────────────────────────────────

async def fetch_db_guides(query: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=6.0) as http:
            res = await http.get(
                f"{BACKEND_URL}/api/guides",
                params={"search": query} if query else {}
            )
            if res.status_code == 200:
                guides = res.json()
                if not guides:
                    return "No matching community guides found."
                parts = []
                for g in guides[:8]:
                    plain = re.sub(r"<[^>]+>", "", g.get("content", ""))[:500]
                    parts.append(
                        f"[GUIDE] \"{g.get('title','Untitled')}\" "
                        f"| Game: {g.get('game','?')} "
                        f"| Difficulty: {g.get('difficulty','?')} "
                        f"| Tags: {', '.join(g.get('tags',[]))}\n{plain}"
                    )
                return "\n\n".join(parts)
    except Exception as e:
        log.error(f"DB fetch error: {e}")
    return "(Community guides unavailable)"


def web_search_sync(query: str, max_results: int = 5) -> str:
    try:
        from ddgs import DDGS
        results = DDGS().text(f"{query} gaming guide strategy tips", max_results=max_results)
        if not results:
            return "No web results found."
        return "\n\n".join(
            f"[WEB] {r.get('title','')}\nSource: {r.get('href','')}\n{r.get('body','')[:400]}"
            for r in results
        )
    except Exception as e:
        log.error(f"Web search error: {e}")
        return f"(Web search unavailable: {e})"


# ─── Groq LLM ─────────────────────────────────────────────────────────────────

async def call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Add it to your .env file. Get one free at https://console.groq.com"
        )

    client = AsyncGroq(api_key=GROQ_API_KEY)

    SYSTEM_PROMPT = """You are GuildGuide Intelligence — a deeply specialized gaming strategy expert and coach with encyclopedic knowledge across all major game genres: RPGs, RTSs, FPSs, MMOs, grand strategy, survival, and competitive games.

## YOUR CORE MANDATE
You provide answers that are **specific, actionable, and immediately useful**. You are FORBIDDEN from:
- Giving generic advice that applies to any game ("practice more", "check your settings", "experiment with builds")
- Padding answers with obvious statements ("dying is bad", "resources are important")
- Repeating the question back to the user
- Giving vague ranges when exact numbers exist ("do some damage" instead of "deal 2,400 burst damage in the opener")
- Listing options without recommending the best one for the stated context

## ANSWER STRUCTURE
Always structure your answer as follows:

### ⚡ Direct Answer
One sharp paragraph: the specific answer with the most important piece of information. No fluff.

### 📋 Step-by-Step Execution
Numbered steps with specifics: exact timings, item names, skill names, hotkeys, resource thresholds, position coordinates where applicable. Every step must have a concrete action.

### 🔢 Key Numbers & Thresholds
Bullet list of critical numerical values: damage thresholds, timing windows (in seconds/turns), resource costs, cooldowns, percentage breakpoints. Skip this section only if truly not applicable.

### ⚠️ Common Mistakes & Counters
Exactly 2-4 specific pitfalls that players actually make on this topic — not obvious ones. Include how to counter or avoid each.

### 📚 Sources Used
Brief note on whether the answer draws from community guides in the database, web search, or your training knowledge.

## SPECIFICITY RULES
- Name exact items, skills, perks, units, buildings — never say "a damage ability"
- Give exact numbers when they exist in gaming knowledge (e.g., "Malenia heals 300 HP per hit regardless of damage negation")
- If the question has limitations (e.g., a new game with little data, a niche strategy), explicitly acknowledge this and give the best available answer
- Reference specific patches/versions if relevant
- If the community guides in the database cover the topic, integrate their specific content

## TONE
Expert. Concise. No filler. Write like a top-ranked player explaining to a smart teammate, not a tutorial for beginners unless beginner is specified."""

    for model in GROQ_MODELS:
        try:
            log.info(f"Trying Groq model: {model}")
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=2000,
            )
            answer = response.choices[0].message.content
            log.info(f"✓ Success with {model}")
            return answer
        except Exception as e:
            err = str(e)
            log.warning(f"[{model}] failed: {err[:120]}")
            if "rate_limit" in err.lower() or "decommissioned" in err.lower() or "model_not_found" in err.lower():
                continue
            raise HTTPException(status_code=500, detail=f"Groq error: {err}")

    raise HTTPException(status_code=503, detail="All Groq models rate-limited. Try again in a moment.")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/ask")
async def ask(request: AskRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    log.info(f"Question: {question}")

    db_context, web_context = await asyncio.gather(
        fetch_db_guides(question),
        asyncio.get_event_loop().run_in_executor(None, web_search_sync, question),
    )

    db_count = db_context.count("[GUIDE]")
    web_count = web_context.count("[WEB]")
    log.info(f"Context: {db_count} DB guides, {web_count} web results")

    prompt = f"""CONTEXT AVAILABLE TO YOU:

=== COMMUNITY GUIDES FROM DATABASE ({db_count} matching guides) ===
{db_context}

=== LIVE WEB SEARCH RESULTS ({web_count} results for "{question}") ===
{web_context}

=== PLAYER'S QUESTION ===
{question}

Instructions: Answer this question using the context above where relevant. If the database guides contain direct information, cite and integrate it. If the question has inherent limitations (obscure topic, very recent game, subjective preference), acknowledge them briefly but still give the most specific answer possible."""

    answer = await call_groq(prompt)
    return {
        "answer": answer,
        "sources": {"db_guides": db_count, "web_results": web_count},
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "provider": "groq",
        "models": GROQ_MODELS,
        "api_key_set": bool(GROQ_API_KEY),
        "backend": BACKEND_URL,
    }
