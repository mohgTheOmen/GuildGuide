import React, { useState } from 'react';
import { Zap, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './InstantActionPage.css';

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
            <div className="answer-body" style={{ whiteSpace: 'pre-wrap' }}>
              {answer}
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
