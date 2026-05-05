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

  const [search, setSearch] = useState('');
  const [game, setGame] = useState('All Games');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (game && game !== 'All Games') params.append('game', game);
        if (category && category !== 'All Categories') params.append('category', category);
        if (sort) params.append('sort', sort);

        const response = await fetch(`http://localhost:8080/api/guides?${params.toString()}`, { headers });
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
            userVote: g.userVote,
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

    const delayDebounceFn = setTimeout(() => {
      fetchGuides();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, game, category, sort]);

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1 className="section-title">Browse Guides</h1>
        <p className="section-subtitle">Discover expert guides for your favorite games</p>
      </div>

      <div className="filters-glass-container">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search guides, content..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="dropdowns">
          <div className="filter-group">
            <label>Game</label>
            <select value={game} onChange={(e) => setGame(e.target.value)}>
              <option value="All Games">All Games</option>
              <option value="elden-ring">Elden Ring</option>
              <option value="wow">World of Warcraft</option>
              <option value="destiny-2">Destiny 2</option>
              <option value="Valorant">Valorant</option>
              <option value="Cyberpunk 2077">Cyberpunk 2077</option>
              <option value="Minecraft">Minecraft</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All Categories">All Categories</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Newest</option>
              <option>Most Popular</option>
              <option>Top Rated</option>
            </select>
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
