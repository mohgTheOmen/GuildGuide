import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import GuideCard from '../components/GuideCard';
import eldenRingImg from '../assets/elden_ring.png';
import valorantImg from '../assets/valorant.png';
import cyberpunkImg from '../assets/cyberpunk.png';
import './BrowsePage.css';


const BrowsePage = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/guides');
        if (response.ok) {
          const data = await response.json();
          const formattedGuides = data.map((g: any) => ({
            id: g.id,
            title: g.title,
            author: g.authorUsername || 'Unknown',
            time: new Date(g.createdAt).toLocaleDateString(),
            views: g.views || 0,
            tags: g.tags || [],
            likes: g.likes || 0,
            dislikes: g.dislikes || 0,
            desc: g.content ? g.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : 'No description',
            image: g.imageUrl || eldenRingImg
          }));
          setGuides(formattedGuides);
        }
      } catch (error) {
        console.error('Failed to fetch guides', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

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
        {loading ? (
          <p style={{ color: 'white' }}>Loading guides...</p>
        ) : guides.length > 0 ? (
          guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))
        ) : (
          <p style={{ color: 'white' }}>No guides found.</p>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
