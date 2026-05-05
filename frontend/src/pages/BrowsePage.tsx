import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ThumbsUp, Eye } from 'lucide-react';
import './BrowsePage.css';

const BrowsePage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [game, setGame] = useState('');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (game) params.append('game', game);
        if (sort) params.append('sort', sort);

        const res = await fetch(`http://localhost:8080/api/guides?${params.toString()}`, { headers });
        if (res.ok) setGuides(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchGuides, 300);
    return () => clearTimeout(timer);
  }, [search, game, sort]);

  const tagColor = (tag: string) => {
    const colors: Record<string, string> = {
      beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444',
      pvp: '#6366f1', pve: '#8b5cf6', build: '#a78bfa', economy: '#60a5fa',
    };
    return colors[tag.toLowerCase()] || '#8892a4';
  };

  return (
    <div className="browse-page">
      {/* Page Header */}
      <div className="browse-page-header">
        <h1 className="browse-title">Directory</h1>
        <p className="browse-subtitle">Discover expert guides from the community</p>
      </div>

      {/* Search + Filters */}
      <div className="browse-controls">
        <div className="browse-search-box">
          <Search size={18} className="browse-search-icon" />
          <input
            className="browse-search-input"
            type="text"
            placeholder="Search all guides..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="browse-filters">
          <select value={game} onChange={e => setGame(e.target.value)}>
            <option value="">All Games</option>
            <option value="elden-ring">Elden Ring</option>
            <option value="wow">World of Warcraft</option>
            <option value="destiny-2">Destiny 2</option>
            <option value="Valorant">Valorant</option>
            <option value="Cyberpunk 2077">Cyberpunk 2077</option>
            <option value="Hearts of Iron IV">Hearts of Iron IV</option>
            <option value="Minecraft">Minecraft</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option>Newest</option>
            <option>Most Popular</option>
            <option>Top Rated</option>
          </select>
        </div>
      </div>

      {/* Guide List */}
      {loading ? (
        <div className="browse-skeleton">
          {[1,2,3,4].map(i => <div key={i} className="skeleton-row" />)}
        </div>
      ) : guides.length === 0 ? (
        <div className="browse-empty">
          <BookOpen size={40} />
          <p>No guides found. Try a different search.</p>
        </div>
      ) : (
        <div className="guide-list">
          {guides.map((g: any) => {
            const tags: string[] = g.tags || [];
            const desc = g.content ? g.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '';
            return (
              <div key={g.id} className="guide-list-card" onClick={() => navigate(`/guide/${g.id}`)}>
                {/* Thumbnail */}
                <div className="guide-thumb">
                  <BookOpen size={24} />
                </div>
                {/* Content */}
                <div className="guide-list-body">
                  <div className="guide-list-tags">
                    {tags.slice(0, 3).map(t => (
                      <span key={t} className="guide-tag" style={{ color: tagColor(t), borderColor: tagColor(t) + '40', background: tagColor(t) + '15' }}>
                        {t}
                      </span>
                    ))}
                    {g.difficulty && (
                      <span className="guide-tag" style={{ color: tagColor(g.difficulty), borderColor: tagColor(g.difficulty) + '40', background: tagColor(g.difficulty) + '15' }}>
                        {g.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="guide-list-title">{g.title}</h3>
                  <p className="guide-list-desc">{desc}</p>
                  <div className="guide-list-meta">
                    <span>by <strong>{g.authorUsername}</strong></span>
                    <span className="meta-sep">·</span>
                    <Eye size={13} /> <span>{g.views || 0}</span>
                    <span className="meta-sep">·</span>
                    <ThumbsUp size={13} /> <span>{g.likes || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
