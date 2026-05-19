import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboardPage.css';

interface AdminStats {
  totalUsers: number;
  totalGuides: number;
  totalComments: number;
}

interface Guide {
  id: number;
  title: string;
  game: string;
  authorUsername: string;
  createdAt: string;
  views: number;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, guidesRes] = await Promise.all([
          fetch('http://localhost:8080/api/admin/stats', { headers }),
          fetch('http://localhost:8080/api/guides', { headers })
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (guidesRes.ok) {
          setGuides(await guidesRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch admin data', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDeleteGuide = async (id: number) => {
    if (!confirm('Are you sure you want to delete this guide as an admin?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setGuides(prev => prev.filter(g => g.id !== id));
        if (stats) setStats({ ...stats, totalGuides: stats.totalGuides - 1 });
        toast.success('Guide successfully deleted.');
      } else {
        toast.error('Failed to delete guide.');
      }
    } catch {
      toast.error('An error occurred while deleting.');
    }
  };

  if (loading) {
    return <div className="admin-dashboard" style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading Admin Panel...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'bottom', marginRight: '0.5rem', color: '#818cf8' }} />Admin Dashboard</h1>
        <p>Platform Statistics and Content Moderation</p>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats?.totalUsers || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BookOpen size={28} /></div>
          <div className="stat-info">
            <h3>Total Guides</h3>
            <p>{stats?.totalGuides || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MessageSquare size={28} /></div>
          <div className="stat-info">
            <h3>Total Comments</h3>
            <p>{stats?.totalComments || 0}</p>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2><BookOpen size={20} /> Manage Content</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Game</th>
                <th>Author</th>
                <th>Date</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide.id}>
                  <td className="guide-title-cell" onClick={() => navigate(`/guide/${guide.id}`)}>
                    {guide.title}
                  </td>
                  <td>{guide.game.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                  <td>{guide.authorUsername}</td>
                  <td>{new Date(guide.createdAt).toLocaleDateString()}</td>
                  <td>{guide.views}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleDeleteGuide(guide.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {guides.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No guides found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
