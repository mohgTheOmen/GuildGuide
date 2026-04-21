import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
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
          <Link to="/profile" className="nav-link">My Account</Link>
        </nav>
        <div className="navbar-actions">
          <Link to="/profile" className="btn btn-ghost">Log In</Link>
          <Link to="/profile" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
