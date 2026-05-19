import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, LogOut, Zap, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, username, avatar, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <Gamepad2 className="logo-icon" size={28} />
          <span>GuildGuide</span>
        </Link>
        <nav className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/browse" className="nav-link">Browse</Link>
          {isLoggedIn && (
            <>
              <Link to="/instant-action" className="nav-link nav-link-highlight">
                <Zap size={16} fill="currentColor" />
                Instant Action
              </Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {role === 'ADMIN' && (
                <Link to="/admin" className="nav-link" style={{ color: '#818cf8', fontWeight: 600 }}>Admin Panel</Link>
              )}
            </>
          )}
        </nav>
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-menu-wrapper">
              <Link to="/profile" className="user-profile-link">
                {avatar ? (
                  <img src={avatar} alt={username || 'Profile'} className="nav-avatar-img" />
                ) : (
                  <User size={18} />
                )}
                <span>{username}</span>
              </Link>
              <Link to="/settings" className="icon-btn" title="Settings">
                <Settings size={18} />
              </Link>
              <button onClick={handleLogout} className="icon-btn logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
