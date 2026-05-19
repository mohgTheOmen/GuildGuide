import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp, Share2, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
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
  isSaved?: boolean;
  isDraft?: boolean;
}

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  guideId: number;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: boolean | null;
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

const formatDifficulty = (difficulty?: string) => {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

const difficultyClass = (difficulty?: string) => {
  return difficulty ? `difficulty-chip difficulty-${difficulty.toLowerCase()}` : '';
};

const formatGameName = (game?: string) => {
  if (!game) return 'Unknown Game';
  return game
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
        
        // Fetch guide details to increment views automatically
        // First increment the views
        if (token) {
          await fetch(`http://localhost:8080/api/guides/${id}/view`, {
            method: 'POST',
            headers
          }).catch(console.error); // Ignore errors here, just fire and forget
        }
        
        const [guideRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/guides/${id}`, { headers }),
          fetch(`http://localhost:8080/api/guides/${id}/comments`, { headers })
        ]);
        if (!guideRes.ok) throw new Error('Guide not found');
        const guideData = await guideRes.json();

        if (guideData.isDraft) {
          navigate(`/edit-guide/${guideData.id}`, { replace: true });
          return;
        }

        setGuide(guideData);

        if (!guideData.isDraft) {
          localStorage.setItem('lastGuideId', String(guideData.id));
          localStorage.setItem('lastGuideTitle', guideData.title);
          saveProgress(guideData.id, 10);
        }

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
  }, [id, username, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const handleToggleSave = async () => {
    if (!username) { toast.error('Please log in to save guides.'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/users/me/saved-guides/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGuide(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
        toast.success(guide?.isSaved ? 'Guide removed from saved' : 'Guide saved successfully');
      } else {
        toast.error('Failed to toggle save state.');
      }
    } catch {
      toast.error('An error occurred.');
    }
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

  const handleCommentVote = async (commentId: number, isUpvote: boolean) => {
    if (!username) { toast.error('Please log in to vote on comments.'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isUpvote })
      });
      if (res.ok) {
        const updatedComment = await res.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      } else {
        toast.error('Failed to vote on comment.');
      }
    } catch {
      toast.error('An error occurred while voting on the comment.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Comment deleted!');
      } else {
        toast.error('Failed to delete comment.');
      }
    } catch {
      toast.error('An error occurred.');
    }
  };

  if (loading) return <div className="active-guide-page"><div className="active-guide-loading">Loading guide...</div></div>;
  if (error || !guide) return <div className="active-guide-page"><div className="active-guide-loading">{error}</div></div>;

  const sections = parseSections(guide.content);
  const userHasComments = Boolean(username && comments.some(c => c.authorUsername === username));
  const sortedComments = [...comments].sort((a, b) => {
    if (userHasComments) {
      const aIsOwn = a.authorUsername === username;
      const bIsOwn = b.authorUsername === username;
      if (aIsOwn !== bIsOwn) return aIsOwn ? -1 : 1;
    }

    const likeDiff = (b.likes || 0) - (a.likes || 0);
    if (likeDiff !== 0) return likeDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderComment = (c: Comment, isOwn: boolean) => (
    <div key={c.id} className="comment-item">
      <div className="comment-header">
        {c.authorAvatarUrl ? (
          <img src={c.authorAvatarUrl} alt="Avatar" className="comment-avatar-img" />
        ) : (
          <div className="comment-avatar">{c.authorUsername.charAt(0).toUpperCase()}</div>
        )}
        <div className="comment-author-block">
          <div className="comment-author-row">
            <span className="comment-author">{c.authorUsername}</span>
            {isOwn && <span className="comment-own-badge">You</span>}
          </div>
          <span className="comment-date">
            {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="comment-card-actions">
          {isOwn && (
            <button className="comment-delete-btn" onClick={() => handleDeleteComment(c.id)}>
              Delete
            </button>
          )}
          <button className={`comment-vote-btn ${c.userVote === true ? 'active-like' : ''}`} onClick={() => handleCommentVote(c.id, true)}>
            <ThumbsUp size={14} />
            <span>{c.likes || 0}</span>
          </button>
          <button className={`comment-vote-btn ${c.userVote === false ? 'active-dislike' : ''}`} onClick={() => handleCommentVote(c.id, false)}>
            <ThumbsDown size={14} />
            <span>{c.dislikes || 0}</span>
          </button>
        </div>
      </div>
      <p className="comment-body">{c.content}</p>
    </div>
  );

  return (
    <div className="active-guide-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/browse')}>
        <ChevronLeft size={16} /> Back to Directory
      </button>

      {/* Guide Header */}
      <div className="active-guide-header">
        <div className="active-guide-tags">
          <span className="ag-tag">{formatGameName(guide.game)}</span>
          {guide.difficulty && <span className={`ag-tag ag-tag-difficulty ${difficultyClass(guide.difficulty)}`}>{formatDifficulty(guide.difficulty)}</span>}
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
          <button className="ag-action-btn" onClick={handleToggleSave}>
            <Star size={15} fill={guide.isSaved ? "currentColor" : "none"} className={guide.isSaved ? "text-yellow-400" : ""} /> 
            {guide.isSaved ? 'Saved' : 'Save'}
          </button>
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
          {sortedComments.map(c => renderComment(c, c.authorUsername === username))}
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="floating-toolbar">
        <button className="float-btn" title="Back to top" aria-label="Back to top" onClick={scrollToTop}>
          <ChevronUp size={20} />
        </button>
        <button className="float-btn" title="Go to bottom" aria-label="Go to bottom" onClick={scrollToBottom}>
          <ChevronDown size={20} />
        </button>
        <button className="float-btn" title={guide.isSaved ? 'Unsave guide' : 'Save guide'} aria-label={guide.isSaved ? 'Unsave guide' : 'Save guide'} onClick={handleToggleSave}>
          <Star size={18} fill={guide.isSaved ? 'currentColor' : 'none'} />
        </button>
        <button className="float-btn" title="Share" aria-label="Share" onClick={handleShare}>
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default GuideDetailPage;
