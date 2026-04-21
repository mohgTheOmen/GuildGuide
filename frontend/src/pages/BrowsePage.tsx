import { Link } from 'react-router-dom';
import { Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import eldenRingImg from '../assets/elden_ring.png';
import valorantImg from '../assets/valorant.png';
import cyberpunkImg from '../assets/cyberpunk.png';
import './BrowsePage.css';

const MOCK_GUIDES = [
  { id: '1', title: 'Boss Fight Strategy - Malenia', author: 'SomeGuy', time: '22 min read', views: '1,200', tags: ['Elden Ring', 'Boss Fight', 'Very Hard'], likes: "3.2k", dislikes: 24, desc: 'Quick guide on how to beat the hardest boss in the game using a proven strategy without taking damage.', image: eldenRingImg },
  { id: '2', title: 'Beginner Tips & Tricks', author: 'ProGamer', time: '10 min read', views: '4,500', tags: ['Valorant', 'Basics'], likes: 890, dislikes: 12, desc: 'Start your journey right with these fundamental tips for climbing out of Iron and reaching Radiant.', image: valorantImg },
  { id: '3', title: 'Complete Achievement Guide', author: 'Completionist', time: '45 min read', views: '800', tags: ['Cyberpunk 2077', '100%'], likes: 120, dislikes: 5, desc: 'A step-by-step walkthrough detailing how to unlock every single achievement and secret ending.', image: cyberpunkImg },
];

const BrowsePage = () => {
  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1 className="section-title">Browse Guides</h1>
        <p className="section-subtitle">Discover expert guides for your favorite games</p>
      </div>

      <div className="filters-glass-container">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <div className="dropdowns">
          <div className="filter-group">
            <label>Game</label>
            <select><option>All Games</option></select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select><option>All Categories</option></select>
          </div>
          <div className="filter-group">
            <label>Platform</label>
            <select><option>All Platforms</option></select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select><option>Most Popular</option></select>
          </div>
        </div>
      </div>

      <div className="guides-grid">
        {MOCK_GUIDES.map(guide => (
          <div key={guide.id} className="guide-card glass-panel">
            <Link to={`/guide/${guide.id}`} className="guide-card-area">
              <div className="guide-card-image">
                <img src={guide.image} alt="Thumbnail" />
              </div>
              <div className="guide-card-content">
                <h3 className="guide-title">{guide.title}</h3>
                <div className="guide-meta">
                  <span className="author">by {guide.author}</span>
                  <span className="dot">•</span>
                  <span>{guide.time}</span>
                  <span className="dot">•</span>
                  <span>{guide.views} views</span>
                </div>
                <p className="guide-desc">{guide.desc}</p>
                <div className="guide-tags">
                  {guide.tags.map(tag => (
                    <span key={tag} className="tag tag-outline">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
            <div className="guide-card-stats">
              <button className="stat-btn stat-like">
                <ThumbsUp size={20} />
                <span>{guide.likes}</span>
              </button>
              <button className="stat-btn stat-dislike">
                <ThumbsDown size={20} />
                <span>{guide.dislikes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
