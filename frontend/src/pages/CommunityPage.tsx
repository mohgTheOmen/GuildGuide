import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CommunityPage.css';

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  createdAt: string;
}

interface Guide {
  id: number;
  title: string;
}

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guideRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/guides/${id}`),
          fetch(`http://localhost:8080/api/guides/${id}/comments`)
        ]);
        if (guideRes.ok) setGuide(await guideRes.json());
        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeleteComment = async (commentId: number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        console.error('Failed to delete comment');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = role === 'ADMIN';

  return (
    <div className="community-page">
      <button className="back-btn" onClick={() => navigate(`/guide/${id}`)}>
        <ChevronLeft size={16} /> Back to Guide
      </button>

      <div className="community-header">
        <div className="community-icon">
          <MessageSquare size={28} />
        </div>
        <h1 className="community-title">Community Feedback</h1>
        {guide && (
          <p className="community-subtitle">
            Analyzed reviews for <strong>{guide.title}</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div className="community-skeleton">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-review" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="community-empty">
          <MessageSquare size={40} />
          <h3>No community feedback yet</h3>
          <p>Be the first to share your thoughts on this guide.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/guide/${id}`)}>
            Go to Guide
          </button>
        </div>
      ) : (
        <div className="review-list">
          {comments.map((comment, i) => (
            <div key={comment.id} className="review-card">
              <div className="review-number">{i + 1}</div>
              <div className="review-body">
                <div className="review-section-label">Review for Section {i + 1}</div>
                <div className="review-quote">
                  <Quote size={16} className="quote-icon" />
                  <p className="review-text">{comment.content}</p>
                </div>
                <div className="review-meta">
                  <div className="review-avatar">{comment.authorUsername.charAt(0).toUpperCase()}</div>
                  <span className="review-author">{comment.authorUsername}</span>
                  <span className="review-sep">·</span>
                  <span className="review-date">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {isAdmin && (
                    <button className="review-delete-btn" onClick={() => handleDeleteComment(comment.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
