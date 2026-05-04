import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Manage your guides and activity</p>
        </div>
        <Link to="/create-guide" className="btn btn-primary">Create New Guide</Link>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button className="tab-btn active">My Published Guides</button>
          <button className="tab-btn">Drafts</button>
          <button className="tab-btn">Saved Guides</button>
        </div>

        <div className="dashboard-panel glass-panel">
          <div className="empty-state">
            <p>You haven't published any guides yet.</p>
            <Link to="/create-guide" className="btn btn-outline">Start Writing</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
