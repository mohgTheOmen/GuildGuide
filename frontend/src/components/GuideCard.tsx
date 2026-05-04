import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import './GuideCard.css';

export interface GuideProps {
  id: string;
  title: string;
  author: string;
  time: string;
  views: string | number;
  tags: string[];
  likes: string | number;
  dislikes: string | number;
  desc: string;
  image: string;
}

const GuideCard: React.FC<{ guide: GuideProps }> = ({ guide }) => {
  return (
    <div className="guide-card glass-panel">
      <Link to={`/guide/${guide.id}`} className="guide-card-area">
        <div className="guide-card-image">
          <img src={guide.image} alt={guide.title} />
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
  );
};

export default GuideCard;
