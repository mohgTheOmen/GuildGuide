import { Link } from 'react-router-dom';
import eldenRingImg from '../assets/elden_ring.png';
import './ProfilePage.css';

const MOCK_SAVED = [
  { id: '1', title: 'Boss Fight Strategy - Malenia', author: 'SomeGuy', time: '22 min read', views: '1,200', tags: ['Elden Ring', 'Boss Fight', 'Very Hard'], likes: "3.2k", dislikes: 24, desc: 'Quick guide on how to beat the hardest boss in the game using a proven strategy without taking damage.', image: eldenRingImg },
];

const ProfilePage = () => {
  return (
    <div className="profile-container">
      <div className="profile-header glass-panel">
        <div className="profile-info">
          <div className="profile-avatar">
            SG
          </div>
          <div className="profile-details">
            <div className="profile-name-row">
              <h1 className="profile-name">SomeGuy</h1>
            </div>
            <p className="profile-joined">Member since January 2026</p>
            <p className="profile-bio">Passionate gamer and guide creator, specializing in RPGs and souls-like games. Always happy to help new players!</p>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-value">12</span>
            <span className="stat-label">Guides Created</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">24</span>
            <span className="stat-label">Guides Liked</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">3,502</span>
            <span className="stat-label">Total Views</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">5</span>
            <span className="stat-label">Games Playing</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="tab">My Games</button>
        <button className="tab active">Saved Guides</button>
      </div>

      <div className="profile-content">
        <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Saved Guides</h2>
        
        <div className="guides-grid">
           {MOCK_SAVED.map(guide => (
             <div key={guide.id} className="guide-card glass-panel flex-row">
               <Link to={`/guide/${guide.id}`} className="guide-card-area flex-1">
                 <div className="guide-card-image" style={{ width: 250 }}>
                   <img src={guide.image} alt="Thumbnail" />
                 </div>
                 <div className="guide-card-content border-r">
                   <h3 className="guide-title">{guide.title}</h3>
                   <div className="guide-meta">
                     <span className="author">by {guide.author}</span> <span className="dot">•</span> 
                     <span>{guide.time}</span> <span className="dot">•</span> 
                     <span>{guide.views} views</span>
                   </div>
                   <p className="guide-desc line-clamp-2">{guide.desc}</p>
                   <div className="guide-tags mt-2">
                      <span className="tag tag-outline">Elden Ring</span>
                      <span className="tag">Boss Fight</span>
                   </div>
                 </div>
               </Link>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
