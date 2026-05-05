import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, BookMarked, MessageSquare, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCommunity = () => {
    const lastId = localStorage.getItem('lastGuideId');
    navigate(lastId ? `/community/${lastId}` : '/browse');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">GG</div>
        <span className="sidebar-logo-text">Gamer's Guide</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Home size={18} />
          <span>My Games</span>
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Directory</span>
        </NavLink>
        <NavLink to="/create-guide" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookMarked size={18} />
          <span>Create Guide</span>
        </NavLink>
        <button
          className={`sidebar-link ${location.pathname.startsWith('/community') ? 'active' : ''}`}
          onClick={handleCommunity}
        >
          <MessageSquare size={18} />
          <span>Community</span>
        </button>
        <NavLink to="/instant-action" className={({ isActive }) => `sidebar-link instant-action-link ${isActive ? 'active' : ''}`}>
          <Zap size={18} />
          <span>Instant Action</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {username && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{username.charAt(0).toUpperCase()}</div>
            <span className="sidebar-username">{username}</span>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
