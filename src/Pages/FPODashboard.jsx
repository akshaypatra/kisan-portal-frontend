import React from 'react';
import authService from '../services/authService';

const FPODashboard = () => {
  const user = authService.getStoredUser();

  return (
    <div className="container mt-4">
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
        <h2 className="mb-2">Welcome, {user?.name || 'FPO Member'}!</h2>
        <p className="lead mb-0">
          Role: Farmer Producer Organization (FPO) / किसान उत्पादक संगठन
        </p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-people-fill me-2"></i>
            FPO Dashboard
          </h5>
          <p className="card-text">
            Your personalized FPO dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>Manage farmer members and collective operations</li>
            <li>Track bulk orders and collective production</li>
            <li>Monitor revenue and member contributions</li>
            <li>Coordinate with traders and storage facilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FPODashboard;
