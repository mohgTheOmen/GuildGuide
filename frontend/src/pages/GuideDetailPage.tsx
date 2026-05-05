import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, ThumbsUp, ThumbsDown, Edit2, ChevronLeft, Monitor, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './GuideDetailPage.css';

interface Guide {
  id: number;
  title: string;
  game: string;
  difficulty: string;
  tags: string[];
  content: string;
  authorUsername: string;
  createdAt: string;
  views: number;
  likes: number;
  dislikes: number;
  userVote?: boolean | null;
}

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  guideId: number;
  createdAt: string;
}

// Store progress in localStorage
const saveProgress = (id: number, pct: number) => {
  try {
    const map = JSON.parse(localStorage.getItem('guideProgress') || '{}');
    map[id] = Math.max(map[id] ?? 0, pct);
    localStorage.setItem('guideProgress', JSON.stringify(map));
  } catch {}
};

const markComplete = (id: number) => {
  try {
    const map = JSON.parse(localStorage.getItem('guideProgress') || '{}');
    map[id] = 100;
    localStorage.setItem('guideProgress', JSON.stringify(map));
  } catch {}
};

// Parse HTML content into named sections
const parseSections = (html: string): Array<{ title: string; body: string }> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');

  if (headings.length === 0) {
    return [{ title: 'Guide Content', body: html }];
  }

  const sections: Array<{ title: string; body: string }> = [];
  headings.forEach((h, i) => {
    let body = '';
    let next = h.nextElementSibling;
    while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
      body += next.outerHTML;
      next = next.nextElementSibling;
    }
    sections.push({ title: h.textContent || `Section ${i + 1}`, body });
  });
  return sections;
};

const GuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { username } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchGuideAndComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
        const [guideRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/guides/${id}`, { headers }),
          fetch(`http://localhost:8080/api/guides/${id}/comments`)
        ]);
        if (!guideRes.ok) throw new Error('Guide not found');
        const guideData = await guideRes.json();
        setGuide(guideData);

        // Save to localStorage for sidebar/community link + set progress
        localStorage.setItem('lastGuideId', String(guideData.id));
        localStorage.setItem('lastGuideTitle', guideData.title);
        saveProgress(guideData.id, 10);

        // Check if already completed
        const map = JSON.parse(localStorage.getItem('guideProgress') || '{}');
        if (map[guideData.id] === 100) setCompleted(true);

        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch {
        setError('Could not load guide.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuideAndComments();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleMarkComplete = () => {
    if (!guide) return;
    markComplete(guide.id);
    setCompleted(true);
    toast.success('Guide marked as complete! 🎉');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
        toast.success('Comment posted!');
      } else toast.error('Failed to post comment. Please log in.');
    } catch { toast.error('An error occurred.'); }
  };

  const handleVote = async (isUpvote: boolean) => {
    if (!username) { toast.error('Please log in to vote.'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isUpvote })
      });
      if (res.ok) setGuide(await res.json());
      else toast.error('Failed to vote.');
    } catch { toast.error('An error occurred while voting.'); }
  };

  if (loading) return <div className="active-guide-page"><div className="active-guide-loading">Loading guide...</div></div>;
  if (error || !guide) return <div className="active-guide-page"><div className="active-guide-loading">{error}</div></div>;

  const isAuthor = username === guide.authorUsername;
  const sections = parseSections(guide.content);

  return (
    <div className="active-guide-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/browse')}>
        <ChevronLeft size={16} /> Back to Directory
      </button>

      {/* Guide Header */}
      <div className="active-guide-header">
        <div className="active-guide-tags">
          <span className="ag-tag">{guide.game}</span>
          {guide.difficulty && <span className="ag-tag ag-tag-difficulty">{guide.difficulty}</span>}
        </div>
        <h1 className="active-guide-title">{guide.title}</h1>
        <div className="active-guide-meta">
          <span className="ag-author">by {guide.authorUsername}</span>
          <span className="ag-sep">·</span>
          <span>v{guide.id}.{guide.views}.0</span>
          <span className="ag-sep">·</span>
          <span>Modified {new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="ag-sep">·</span>
          <span>{guide.views} views</span>
        </div>
        <div className="active-guide-actions">
          <button className="ag-vote-btn" onClick={() => handleVote(true)}>
            <ThumbsUp size={15} className={guide.userVote === true ? 'voted-up' : ''} />
            <span>{guide.likes}</span>
          </button>
          <button className="ag-vote-btn" onClick={() => handleVote(false)}>
            <ThumbsDown size={15} className={guide.userVote === false ? 'voted-down' : ''} />
            <span>{guide.dislikes}</span>
          </button>
          <button className="ag-action-btn" onClick={handleShare}><Share2 size={15} /> Share</button>
          {!completed && (
            <button className="ag-action-btn ag-complete-btn" onClick={handleMarkComplete}>
              Mark Complete
            </button>
          )}
          {completed && <span className="ag-completed-badge">✓ Completed</span>}
        </div>
      </div>

      {/* Sections */}
      <div className="active-guide-sections">
        {sections.map((sec, i) => (
          <div key={i} className="guide-section-card">
            <div className="section-number">SEC {i + 1}</div>
            <h2 className="section-title">{sec.title}</h2>
            <div className="section-body" dangerouslySetInnerHTML={{ __html: sec.body || guide.content }} />
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="active-guide-comments">
        <h3 className="comments-title">Comments <span className="comments-count">{comments.length}</span></h3>

        {username ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-input"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this guide..."
              rows={3}
            />
            <button type="submit" className="btn btn-primary comment-submit" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </form>
        ) : (
          <p className="login-prompt">Please <a href="/login">log in</a> to post a comment.</p>
        )}

        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-avatar">{c.authorUsername.charAt(0).toUpperCase()}</div>
                <div>
                  <span className="comment-author">{c.authorUsername}</span>
                  <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="comment-body">{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="floating-toolbar">
        <button className="float-btn" title="Overview" onClick={() => navigate('/browse')}>
          <Monitor size={18} />
        </button>
        {isAuthor && (
          <button className="float-btn" title="Edit Guide" onClick={() => navigate(`/edit-guide/${guide.id}`)}>
            <Edit2 size={18} />
          </button>
        )}
        <button className="float-btn" title="Community Feedback" onClick={() => navigate(`/community/${guide.id}`)}>
          <MessageSquare size={18} />
        </button>
        <button className="float-btn" title="Share" onClick={handleShare}>
          <Star size={18} />
        </button>
      </div>
    </div>
  );
};

export default GuideDetailPage;
