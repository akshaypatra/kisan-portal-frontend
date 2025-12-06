import React from 'react';
import authService from '../services/authService';
import AIAdvisoryBanner from '../Components/Common/AIAdvisoryBanner';

const TraderDashboard = () => {
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
        <h2 className="mb-2">Welcome, {user?.name || 'Trader'}!</h2>
        <p className="lead mb-0">Role: Trader / व्यापारी</p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-graph-up me-2"></i>
            Trader Dashboard
          </h5>
          <p className="card-text">
            Your personalized trader dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>View and manage active trades</li>
            <li>Track trade volume and profitability</li>
            <li>Monitor pending deals and negotiations</li>
            <li>Connect with farmers, FPOs, and manufacturers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TraderDashboard;
