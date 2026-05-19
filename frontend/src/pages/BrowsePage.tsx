import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ThumbsUp, Eye } from 'lucide-react';
import './BrowsePage.css';

const DEFAULT_GUIDE_IMAGE = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const;
type Difficulty = typeof DIFFICULTY_OPTIONS[number];

const BrowsePage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [game, setGame] = useState('');
  const [sort, setSort] = useState('Newest');
  const [tagFilter, setTagFilter] = useState('');

  const normalizedTagFilter = tagFilter.trim().toLowerCase();
  const selectedDifficulty: '' | Difficulty = (DIFFICULTY_OPTIONS as readonly string[]).includes(normalizedTagFilter)
    ? (normalizedTagFilter as Difficulty)
    : '';

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
        if (tagFilter) params.append('category', tagFilter);
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
  }, [search, game, sort, tagFilter]);

  const toggleTagFilter = (tag: string) => {
    setTagFilter(prev => prev.toLowerCase() === tag.toLowerCase() ? '' : tag);
  };

  const clearAllFilters = () => {
    setSearch('');
    setGame('');
    setSort('Newest');
    setTagFilter('');
  };

  const hasAnyFilters = Boolean(search.trim() || game || tagFilter || (sort && sort !== 'Newest'));

  const tagColor = (tag: string) => {
    const colors: Record<string, string> = {
      beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444',
      pvp: '#6366f1', pve: '#8b5cf6', build: '#a78bfa', economy: '#60a5fa',
    };
    return colors[tag.toLowerCase()] || '#8892a4';
  };

  const difficultyClass = (difficulty?: string) => {
    return difficulty ? `difficulty-chip difficulty-${difficulty.toLowerCase()}` : '';
  };

  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return '';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="browse-page">
      <div className="browse-page-header">
        <h1 className="browse-title">Directory</h1>
        <p className="browse-subtitle">Discover expert guides from the community</p>
      </div>

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
          <select
            value={selectedDifficulty}
            onChange={e => setTagFilter(e.target.value)}
            aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option>Newest</option>
            <option>Most Popular</option>
            <option>Top Rated</option>
          </select>
        </div>
      </div>

      {hasAnyFilters && (
        <div className="browse-active-filters" aria-label="Active filters">
          <span className="active-filters-label">Active:</span>

          {search.trim() && (
            <span className="active-filter-chip">
              Search: {search.trim()}
              <button className="active-filter-clear" type="button" onClick={() => setSearch('')} aria-label="Clear search">
                ×
              </button>
            </span>
          )}

          {game && (
            <span className="active-filter-chip">
              Game: {game}
              <button className="active-filter-clear" type="button" onClick={() => setGame('')} aria-label="Clear game filter">
                ×
              </button>
            </span>
          )}

          {tagFilter && (
            <span className="active-filter-chip">
              {selectedDifficulty ? `Difficulty: ${formatDifficulty(selectedDifficulty)}` : `Tag: ${tagFilter}`}
              <button className="active-filter-clear" type="button" onClick={() => setTagFilter('')} aria-label="Clear tag/difficulty filter">
                ×
              </button>
            </span>
          )}

          {sort && sort !== 'Newest' && (
            <span className="active-filter-chip">
              Sort: {sort}
              <button className="active-filter-clear" type="button" onClick={() => setSort('Newest')} aria-label="Reset sort">
                ×
              </button>
            </span>
          )}

          <button className="active-filters-reset" type="button" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="browse-skeleton">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-row" />)}
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
            const imageUrl = g.imageUrl || DEFAULT_GUIDE_IMAGE;
            const score = (g.likes || 0) - (g.dislikes || 0);
            return (
              <div key={g.id} className="guide-list-card" onClick={() => navigate(`/guide/${g.id}`)}>
                <div className="guide-thumb">
                  <img src={imageUrl} alt={g.title} />
                </div>
                <div className="guide-list-body">
                  <div className="guide-list-tags">
                    {tags.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className={`guide-tag ${tagFilter && tagFilter.toLowerCase() === t.toLowerCase() ? 'guide-tag-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleTagFilter(t); }}
                        style={{ color: tagColor(t), borderColor: tagColor(t) + '40', background: tagColor(t) + '15' }}
                      >
                        {t}
                      </span>
                    ))}
                    {g.difficulty && (
                      <span
                        className={`guide-tag ${difficultyClass(g.difficulty)} ${tagFilter && tagFilter.toLowerCase() === g.difficulty.toLowerCase() ? 'guide-tag-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleTagFilter(g.difficulty); }}
                      >
                        {formatDifficulty(g.difficulty)}
                      </span>
                    )}
                  </div>
                  <h3 className="guide-list-title">{g.title}</h3>
                  <p className="guide-list-desc">{desc}</p>
                  <div className="guide-list-meta">
                    <span>by <strong>{g.authorUsername}</strong></span>
                    <span className="meta-sep" aria-hidden="true" />
                    <Eye size={13} /> <span>{g.views || 0}</span>
                    <span className="meta-sep" aria-hidden="true" />
                    <ThumbsUp size={13} /> <span>{score}</span>
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
