import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import GuideCard from '../components/GuideCard';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { isLoggedIn, username, avatar, bio } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'activity'>('saved');
  const [savedGuides, setSavedGuides] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [guidesRes, commentsRes] = await Promise.all([
          fetch('http://localhost:8080/api/users/me/saved-guides', { headers }),
          fetch('http://localhost:8080/api/users/me/comments', { headers })
        ]);
        
        if (guidesRes.ok) {
          const guidesData = await guidesRes.json();
          setSavedGuides(guidesData);
        }
        
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setMyComments(commentsData);
        }
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [isLoggedIn]);

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      // To delete we need guideId, but we might just need to delete by commentId?
      // Wait, CommentController is /api/guides/{guideId}/comments/{commentId}
      // Let's find the guideId from the comment
      const comment = myComments.find(c => c.id === commentId);
      if (!comment) return;
      
      const res = await fetch(`http://localhost:8080/api/guides/${comment.guideId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const userInitial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div className="profile-container">
      <div className="profile-header glass-panel">
        <div className="profile-info">
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt={username || 'Profile'} className="avatar-img" />
            ) : (
              userInitial
            )}
          </div>
          <div className="profile-details">
            <div className="profile-name-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 className="profile-name">{username}</h1>
              <Link to="/settings" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Edit Settings</Link>
            </div>
            <p className="profile-joined">Member since May 2026</p>
            <p className="profile-bio">{bio}</p>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-value">{savedGuides.length}</span>
            <span className="stat-label">Guides Saved</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{myComments.length}</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Guides
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          My Activity
        </button>
      </div>

      <div className="profile-content">
        {loading ? (
          <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : activeTab === 'saved' ? (
          <div>
            <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Saved Guides</h2>
            {savedGuides.length === 0 ? (
              <div style={{ color: '#8892a4', padding: '2rem 0' }}>No saved guides yet. Start exploring and save some guides!</div>
            ) : (
              <div className="guides-grid">
                 {savedGuides.map(guide => (
                   <GuideCard key={guide.id} guide={{
                     id: guide.id,
                     title: guide.title,
                     author: guide.authorUsername,
                     time: new Date(guide.createdAt).toLocaleDateString(),
                     views: guide.views,
                     tags: guide.tags || [],
                     likes: guide.likes,
                     dislikes: guide.dislikes,
                     desc: guide.content ? guide.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : '',
                     image: guide.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070'
                   }} />
                 ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="section-title" style={{marginBottom: '1.5rem'}}>My Comments</h2>
            {myComments.length === 0 ? (
              <div style={{ color: '#8892a4', padding: '2rem 0' }}>No comments yet. Join the discussion on some guides!</div>
            ) : (
              <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myComments.map(comment => (
                  <div key={comment.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <MessageSquare size={20} style={{ color: '#10b981', marginTop: '0.2rem' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'white', marginBottom: '1rem' }}>{comment.content}</p>
                        <Link 
                          to={`/guide/${comment.guideId}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}
                        >
                          View Guide <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
