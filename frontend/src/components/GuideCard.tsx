import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
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
  userVote?: boolean | null;
  desc: string;
  image: string;
}

const GuideCard: React.FC<{ guide: GuideProps }> = ({ guide }) => {
  const { username } = useAuth();
  const [localLikes, setLocalLikes] = useState(Number(guide.likes));
  const [localDislikes, setLocalDislikes] = useState(Number(guide.dislikes));
  const [localVote, setLocalVote] = useState<boolean | null | undefined>(guide.userVote);

  const handleVote = async (e: React.MouseEvent, isUpvote: boolean) => {
    e.preventDefault(); // Prevent navigating to guide detail
    e.stopPropagation();
    
    if (!username) {
      toast.error('Please log in to vote.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/guides/${guide.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isUpvote })
      });

      if (response.ok) {
        const updatedGuide = await response.json();
        setLocalLikes(updatedGuide.likes);
        setLocalDislikes(updatedGuide.dislikes);
        setLocalVote(updatedGuide.userVote);
      } else {
        toast.error('Failed to vote.');
      }
    } catch (err) {
      toast.error('An error occurred while voting.');
    }
  };

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
        <button className={`stat-btn stat-like ${localVote === true ? 'active' : ''}`} onClick={(e) => handleVote(e, true)}>
          <ThumbsUp size={20} />
          <span>{localLikes}</span>
        </button>
        <button className={`stat-btn stat-dislike ${localVote === false ? 'active' : ''}`} onClick={(e) => handleVote(e, false)}>
          <ThumbsDown size={20} />
          <span>{localDislikes}</span>
        </button>
      </div>
    </div>
  );
};

export default GuideCard;
