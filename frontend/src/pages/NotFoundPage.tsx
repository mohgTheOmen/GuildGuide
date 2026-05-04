import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container glass-panel">
        <h1 className="error-code">404</h1>
        <h2 className="section-title">Page Not Found</h2>
        <p className="section-subtitle">
          Looks like you ventured too far off the map.
          The page you are looking for does not exist.
        </p>
        <div className="actions">
          <Link to="/" className="btn btn-primary">Return Home</Link>
          <Link to="/browse" className="btn btn-outline">Browse Guides</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
