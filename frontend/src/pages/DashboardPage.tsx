import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

// Progress is stored as { [guideId]: 0-100 } in localStorage
const getGuideProgress = (id: number): number => {
  try {
    const map = JSON.parse(localStorage.getItem('guideProgress') || '{}');
    return map[id] ?? 0;
  } catch { return 0; }
};

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
}

const DashboardPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGuides = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/guides/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGuides(data);
        }
      } catch {
        console.error('Failed to fetch guides');
      } finally {
        setLoading(false);
      }
    };
    fetchMyGuides();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this guide?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGuides(g => g.filter(g => g.id !== id));
        toast.success('Guide deleted.');
      }
    } catch {
      toast.error('Failed to delete guide.');
    }
  };

  const difficultyColor = (d: string) => {
    if (d === 'beginner') return '#10b981';
    if (d === 'intermediate') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-welcome">Welcome back{username ? `, ${username}` : ''}</h1>
          <p className="dashboard-sub">Ready to continue your training?</p>
        </div>
        <button className="btn btn-primary dashboard-create-btn" onClick={() => navigate('/create-guide')}>
          <Plus size={16} /> New Guide
        </button>
      </div>

      {/* My Guides Section */}
      <div className="dashboard-section">
        <div className="section-label">
          <BookOpen size={16} />
          <span>My Guides</span>
          <span className="guide-count">{guides.length}</span>
        </div>

        {loading ? (
          <div className="dashboard-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : guides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={36} /></div>
            <h3>No guides yet</h3>
            <p>Create your first guide and share your knowledge</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-guide')}>
              <Plus size={16} /> Create Guide
            </button>
          </div>
        ) : (
          <div className="my-guides-list">
            {guides.map((guide, idx) => (
              <div key={guide.id} className="my-guide-card">
                <div className="guide-card-left">
                  <div className="guide-card-header">
                    <span className="game-name">{guide.game}</span>
                    <span className="active-badge">Active</span>
                  </div>
                  <h3 className="my-guide-title">{guide.title}</h3>
                  <div className="my-guide-meta">
                    <span className="difficulty-badge" style={{ color: difficultyColor(guide.difficulty) }}>
                      {guide.difficulty}
                    </span>
                    <span className="meta-sep">•</span>
                    <span className="meta-date">
                      {new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="meta-sep">•</span>
                    <span className="meta-views">{guide.views} views</span>
                  </div>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Training Progress</span>
                      <span className="progress-pct">{getGuideProgress(guide.id)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${getGuideProgress(guide.id)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="guide-card-right">
                  <button className="continue-btn" onClick={() => navigate(`/guide/${guide.id}`)}>
                    Continue Guide <ArrowRight size={16} />
                  </button>
                  <div className="guide-card-actions">
                    <button className="icon-action edit" onClick={() => navigate(`/edit-guide/${guide.id}`)}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="icon-action delete" onClick={() => handleDelete(guide.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
