import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

interface Guide {
  id: number;
  title: string;
  game: string;
  createdAt: string;
  views: number;
  likes: number;
}

const DashboardPage: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/guides/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      }
    } catch (error) {
      toast.error('Failed to load your guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGuides();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this guide? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      toast.success('Guide deleted.');
      setGuides(prev => prev.filter(g => g.id !== id));
    } catch {
      toast.error('Failed to delete guide.');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Manage your guides and activity</p>
        </div>
        <Link to="/create-guide" className="btn btn-primary">Create New Guide</Link>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button className="tab-btn active">My Published Guides</button>
        </div>

        <div className="dashboard-panel glass-panel">
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading your guides...</p>
          ) : guides.length === 0 ? (
            <div className="empty-state">
              <p>You haven't published any guides yet.</p>
              <Link to="/create-guide" className="btn btn-outline">Start Writing</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Game</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Views</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Likes</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link to={`/guide/${guide.id}`} style={{ color: 'var(--accent-cyan)' }}>{guide.title}</Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{guide.game}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{new Date(guide.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{guide.views}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{guide.likes}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/edit-guide/${guide.id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          <Edit2 size={14} /> Edit
                        </Link>
                        <button onClick={() => handleDelete(guide.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#f87171', borderColor: '#f87171' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
