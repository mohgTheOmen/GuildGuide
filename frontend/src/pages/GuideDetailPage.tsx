import { Edit2, Share2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import './GuideDetailPage.css';

const GuideDetailPage = () => {
  return (
    <div className="guide-detail-container">
      {/* Header */}
      <div className="guide-hero glass-panel">
        <div className="guide-hero-tags">
          <span className="tag tag-outline">Elden Ring</span>
        </div>
        <h1 className="guide-hero-title">Complete Beginner's Guide to Elden Ring</h1>
        <div className="guide-hero-meta">
          <span className="author">SomeGuy</span> <span className="dot">•</span> 
          <span>10 min read</span> <span className="dot">•</span> 
          <span>19,400 views</span> <span className="dot">•</span> 
          <span>Mar 22, 2026</span>
        </div>
        <div className="guide-hero-actions">
          <button className="btn btn-primary"><Edit2 size={16} /> Edit Guide</button>
          <button className="btn btn-outline"><Share2 size={16} /> Share</button>
        </div>
      </div>

      <div className="guide-layout">
        {/* Sidebar */}
        <aside className="guide-sidebar glass-panel">
          <h3 className="sidebar-title">Chapters</h3>
          <ul className="chapter-list">
            <li className="active">1. Introduction</li>
            <li>2. Character Creation</li>
            <li>3. Basic Combat</li>
            <li>4. Combat Encounters</li>
            <li>5. Upgrading Items</li>
          </ul>
          <button className="btn btn-primary w-full mt-auto">End & Review</button>
        </aside>

        {/* Content */}
        <div className="guide-content glass-panel">
          <div className="content-header">
            <h2>1. Introduction</h2>
            <div className="content-actions">
              <span className="vote-count">859</span>
              <button className="icon-btn"><ThumbsUp size={18} /></button>
              <span className="vote-count">19</span>
              <button className="icon-btn"><ThumbsDown size={18} /></button>
            </div>
          </div>
          
          <div className="content-body">
            <p>Elden Ring is an action role-playing game developed by FromSoftware. It combines challenging combat with an open-world exploration experience. The game features a vast interconnected world filled with dungeons, bosses, and various biomes to explore.</p>
            <p>Elden Ring is an action role-playing game developed by FromSoftware. It combines challenging combat with an open-world exploration experience. The game features a vast interconnected world filled with dungeons, bosses, and various biomes to explore.</p>
          </div>

          <div className="comments-section">
            <button className="btn btn-ghost comments-btn">
              <MessageSquare size={18} />
              Comments (2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailPage;
