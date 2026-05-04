import { Link } from 'react-router-dom';
import { Gamepad2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <Gamepad2 className="logo-icon" size={28} />
          <span>GuildGuide</span>
        </Link>
        <nav className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/browse" className="nav-link">Browse Guides</Link>
          {isLoggedIn && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
        </nav>
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <span style={{ color: 'var(--text-secondary)', marginRight: '1rem', fontSize: '0.9rem' }}>
                Welcome, <strong style={{ color: 'var(--text-primary)' }}>{username}</strong>
              </span>
              <button onClick={logout} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
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
