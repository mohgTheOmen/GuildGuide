import { Link } from 'react-router-dom';
import homeImg from '../assets/home.png';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master Every Game<br />with Expert Guides</h1>
          <p className="hero-subtitle">
            GuildGuide helps you easily discover and create amazing game guides. Find what you need to beat your favorite game.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary hero-btn">Make an Account</Link>
            <Link to="/login" className="btn btn-outline hero-btn">Log In</Link>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src={homeImg} alt="Gaming Setup" className="hero-image" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
