import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, ThumbsUp, ThumbsDown, MessageSquare, Edit2 } from 'lucide-react';
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
  imageUrl: string;
}

const GuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { username } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/guides/${id}`);
        if (!response.ok) throw new Error('Guide not found');
        const data = await response.json();
        setGuide(data);
      } catch (err) {
        setError('Could not load guide.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <div className="guide-detail-container" style={{ color: 'white', padding: '2rem' }}>Loading...</div>;
  if (error || !guide) return <div className="guide-detail-container" style={{ color: 'white', padding: '2rem' }}>{error}</div>;

  const isAuthor = username === guide.authorUsername;

  return (
    <div className="guide-detail-container">
      <div className="guide-hero glass-panel">
        <div className="guide-hero-tags">
          <span className="tag tag-outline">{guide.game}</span>
          {guide.difficulty && <span className="tag tag-outline">{guide.difficulty}</span>}
        </div>
        <h1 className="guide-hero-title">{guide.title}</h1>
        <div className="guide-hero-meta">
          <span className="author">{guide.authorUsername}</span> <span className="dot">•</span>
          <span>{guide.views} views</span> <span className="dot">•</span>
          <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="guide-hero-actions">
          {isAuthor && (
            <button className="btn btn-primary" onClick={() => navigate(`/edit-guide/${guide.id}`)}>
              <Edit2 size={16} /> Edit Guide
            </button>
          )}
          <button className="btn btn-outline" onClick={handleShare}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <div className="guide-layout">
        <aside className="guide-sidebar glass-panel">
          <h3 className="sidebar-title">Tags</h3>
          <ul className="chapter-list">
            {guide.tags && guide.tags.length > 0
              ? guide.tags.map((tag, i) => <li key={i}>{tag}</li>)
              : <li>No tags</li>}
          </ul>
        </aside>

        <div className="guide-content glass-panel">
          <div className="content-header">
            <h2>{guide.title}</h2>
            <div className="content-actions">
              <span className="vote-count">{guide.likes}</span>
              <button className="icon-btn"><ThumbsUp size={18} /></button>
              <span className="vote-count">{guide.dislikes}</span>
              <button className="icon-btn"><ThumbsDown size={18} /></button>
            </div>
          </div>

          <div className="content-body" dangerouslySetInnerHTML={{ __html: guide.content }} />

          <div className="comments-section">
            <button className="btn btn-ghost comments-btn">
              <MessageSquare size={18} />
              Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailPage;
