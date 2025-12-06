import React from 'react';
import authService from '../services/authService';
import AIAdvisoryBanner from '../Components/Common/AIAdvisoryBanner';

const PolicyMakerDashboard = () => {
  const user = authService.getStoredUser();

  return (
    <div className="container mt-4">
      <AIAdvisoryBanner />
      {/* Header with Kisan Portal gradient styling */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          borderRadius: '12px',
          padding: '30px',
          color: 'white',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h2 className="mb-2">Welcome, {user?.name || 'Policy Maker'}!</h2>
        <p className="lead mb-0">Role: Policy Maker / नीति निर्माता</p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-clipboard-data me-2"></i>
            Policy Maker Dashboard
          </h5>
          <p className="card-text">
            Your personalized policy maker dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>Monitor system-wide stakeholder metrics</li>
            <li>Track aggregate production volumes and trends</li>
            <li>Analyze market price indices and compliance rates</li>
            <li>Generate reports for policy decisions and regulations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PolicyMakerDashboard;
