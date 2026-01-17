/**
 * Dashboard Page
 * 
 * Overview of messaging statistics and recent activity.
 */

import React from 'react';
import './Pages.css';

const Dashboard: React.FC = () => {
  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Messages Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Active Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Bulk Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0%</div>
          <div className="stat-label">Delivery Rate</div>
        </div>
      </div>
      
      <div className="section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="empty-state">
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
