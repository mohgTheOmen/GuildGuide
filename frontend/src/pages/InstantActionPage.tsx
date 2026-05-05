import React, { useState } from 'react';
import { Zap, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './InstantActionPage.css';

/** Lightweight Markdown → React renderer (no deps needed) */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
    let last = 0, m;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[1]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[4]}</em>);
      else if (m[5]) parts.push(<code key={m.index} className="md-code">{m[6]}</code>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="md-h3">{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="md-h2">{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="md-h1">{parseInline(line.slice(2))}</h1>);
    } else if (line.match(/^[-*] /)) {
      // Collect consecutive bullet items
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(<li key={i}>{parseInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>);
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i}>{parseInline(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>);
      continue;
    } else if (line.startsWith('---') || line.startsWith('===')) {
      elements.push(<hr key={i} className="md-hr" />);
    } else if (line.trim() === '') {
      // skip blank
    } else {
      elements.push(<p key={i} className="md-p">{parseInline(line)}</p>);
    }
    i++;
  }

  return <div className="markdown-body">{elements}</div>;
};

const SUGGESTIONS = [
  'Optimal build path for Germany 1936',
  'How to beat Malenia with a strength build',
  'Best PvP class in World of Warcraft',
  'How to efficiently farm resources in Destiny 2',
];

const InstantActionPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleAsk = async (q?: string) => {
    const query = q || question;
    if (!query.trim()) return;

    setQuestion(query);
    setLoading(true);
    setHasAsked(true);
    setAnswer('');

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (!response.ok) throw new Error('Failed to get answer');
      const data = await response.json();
      setAnswer(data.answer);
    } catch {
      toast.error('Failed to get an answer. Please try again.');
      setHasAsked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAsk();
  };

  return (
    <div className="instant-action-page">
      <div className={`instant-action-container ${hasAsked ? 'has-answer' : ''}`}>
        <div className="instant-action-header">
          <div className="instant-action-icon">
            <Zap size={28} fill="currentColor" />
          </div>
          <h1 className="instant-action-title">Instant Action Intelligence</h1>
          <p className="instant-action-subtitle">
            Ask any complex strategy question and get a clear action path immediately
          </p>
        </div>

        <div className="instant-action-input-wrapper">
          <Search size={20} className="input-search-icon" />
          <input
            className="instant-action-input"
            type="text"
            placeholder="Ask a tactical question... (e.g. How to counter rush strategies?)"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="instant-action-send"
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <span className="loading-dots"><span /><span /><span /></span>
            ) : (
              <ArrowRight size={20} />
            )}
          </button>
        </div>

        {!hasAsked && (
          <div className="instant-suggestions">
            <span className="suggestions-label">⌘ Try asking:</span>
            <div className="suggestions-chips">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => handleAsk(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="instant-loading">
            <div className="thinking-indicator">
              <Zap size={16} />
              <span>GuildGuide Intelligence is thinking...</span>
            </div>
          </div>
        )}

        {answer && !loading && (
          <div className="instant-answer glass-panel">
            <div className="answer-header">
              <Zap size={16} />
              <span>Answer</span>
            </div>
            <div className="answer-body">
              <MarkdownRenderer content={answer} />
            </div>
            <button
              className="ask-another-btn"
              onClick={() => { setHasAsked(false); setAnswer(''); setQuestion(''); }}
            >
              Ask another question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantActionPage;
