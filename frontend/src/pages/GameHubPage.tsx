import React from 'react';
import { useParams, Link } from 'react-router-dom';
import GuideCard from '../components/GuideCard';
import eldenRingImg from '../assets/elden_ring.png';
import './GameHubPage.css';

const MOCK_GAME_GUIDES = [
  { id: '1', title: 'Boss Fight Strategy - Malenia', author: 'SomeGuy', time: '22 min read', views: '1,200', tags: ['Elden Ring', 'Boss Fight', 'Very Hard'], likes: "3.2k", dislikes: 24, desc: 'Quick guide on how to beat the hardest boss in the game.', image: eldenRingImg },
  { id: '2', title: 'Ultimate Starter Guide', author: 'ProGamer123', time: '15 min read', views: '5,000', tags: ['Elden Ring', 'Basics'], likes: "1.2k", dislikes: 5, desc: 'Everything you need to know to get started.', image: eldenRingImg },
];

const GameHubPage: React.FC = () => {
  const { gameId } = useParams();

  // In a real application, you'd fetch game details based on gameId
  const gameName = gameId ? gameId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown Game';

  return (
    <div className="game-hub-page">
      <div className="game-hero glass-panel">
        <h1 className="game-title">{gameName}</h1>
        <p className="game-subtitle">Explore top guides, builds, and strategies</p>
        <Link to="/create-guide" className="btn btn-primary mt-4">Write a Guide</Link>
      </div>

      <div className="game-content">
        <div className="guides-section">
          <h2 className="section-title">Popular Guides</h2>
          <div className="guides-grid">
            {MOCK_GAME_GUIDES.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>

        <div className="sidebar glass-panel">
          <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Top Contributors</h2>
          <ul className="contributors-list">
            <li>1. ProGamer123 (42 guides)</li>
            <li>2. NoobSlayer (28 guides)</li>
            <li>3. FarmSimulator (15 guides)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameHubPage;
