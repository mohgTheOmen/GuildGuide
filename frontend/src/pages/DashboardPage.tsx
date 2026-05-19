import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Plus, BookOpen, Trash2, Edit2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

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
  difficulty?: string;
  tags: string[];
  content: string;
  authorUsername: string;
  createdAt: string;
  views: number;
  likes: number;
  isDraft?: boolean;
}

const DashboardPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [savedGuides, setSavedGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const [myGuidesRes, savedGuidesRes] = await Promise.all([
          fetch('http://localhost:8080/api/guides/my', { headers }),
          fetch('http://localhost:8080/api/users/me/saved-guides', { headers })
        ]);

        if (myGuidesRes.ok) {
          setGuides(await myGuidesRes.json());
        }

        if (savedGuidesRes.ok) {
          setSavedGuides(await savedGuidesRes.json());
        }
      } catch {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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

  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return 'Unspecified';
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

  const renderMetaSeparator = () => <span className="meta-sep" aria-hidden="true" />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-welcome">Welcome back{username ? `, ${username}` : ''}</h1>
          <p className="dashboard-sub">Ready to continue your training?</p>
        </div>
        <button className="btn btn-primary dashboard-create-btn" onClick={() => navigate('/create-guide')}>
          <Plus size={16} /> New Guide
        </button>
      </div>

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
            {guides.map((guide) => (
              <div key={guide.id} className="my-guide-card">
                <div className="guide-card-left">
                  <div className="guide-card-header">
                    <span className="game-name">{formatGameName(guide.game)}</span>
                    <span className={guide.isDraft ? 'draft-badge' : 'active-badge'}>
                      {guide.isDraft ? 'Draft' : 'Active'}
                    </span>
                  </div>
                  <h3 className="my-guide-title">{guide.title}</h3>
                  <div className="my-guide-meta">
                    <span className={`difficulty-badge ${difficultyClass(guide.difficulty)}`}>
                      {formatDifficulty(guide.difficulty)}
                    </span>
                    {renderMetaSeparator()}
                    <span className="meta-date">
                      {new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {renderMetaSeparator()}
                    <span className="meta-views">{guide.views} views</span>
                  </div>
                </div>
                <div className="guide-card-right">
                  <button className="continue-btn" onClick={() => navigate(guide.isDraft ? `/edit-guide/${guide.id}` : `/guide/${guide.id}`)}>
                    {guide.isDraft ? 'Edit Draft' : 'View Guide'} <ArrowRight size={16} />
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

      <div className="dashboard-section saved-guides-section">
        <div className="section-label">
          <Star size={16} />
          <span>Saved Guides</span>
          <span className="guide-count">{savedGuides.length}</span>
        </div>

        {loading ? (
          <div className="dashboard-skeleton">
            {[1, 2].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : savedGuides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Star size={36} /></div>
            <h3>No saved guides yet</h3>
            <p>Save guides from the directory and continue reading them here</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              <BookOpen size={16} /> Browse Guides
            </button>
          </div>
        ) : (
          <div className="my-guides-list">
            {savedGuides.map((guide) => (
              <div key={guide.id} className="my-guide-card saved-guide-card">
                <div className="guide-card-left">
                  <div className="guide-card-header">
                    <span className="game-name">{formatGameName(guide.game)}</span>
                    <span className="saved-badge">Saved</span>
                  </div>
                  <h3 className="my-guide-title">{guide.title}</h3>
                  <div className="my-guide-meta">
                    <span>by <strong>{guide.authorUsername}</strong></span>
                    {renderMetaSeparator()}
                    <span className={`difficulty-badge ${difficultyClass(guide.difficulty)}`}>
                      {formatDifficulty(guide.difficulty)}
                    </span>
                    {renderMetaSeparator()}
                    <span className="meta-views">{guide.views} views</span>
                  </div>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Reading Progress</span>
                      <span className="progress-pct">{getGuideProgress(guide.id)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${getGuideProgress(guide.id)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="guide-card-right">
                  <button className="continue-btn" onClick={() => navigate(`/guide/${guide.id}`)}>
                    Continue Reading <ArrowRight size={16} />
                  </button>
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
