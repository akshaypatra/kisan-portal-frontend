import React from 'react';
import authService from '../services/authService';

const StorageDashboard = () => {
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
        <h2 className="mb-2">Welcome, {user?.name || 'Storage Manager'}!</h2>
        <p className="lead mb-0">Role: Storage / भंडारण</p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-box-seam me-2"></i>
            Storage Dashboard
          </h5>
          <p className="card-text">
            Your personalized storage dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>Monitor storage capacity and utilization rates</li>
            <li>Track current stock levels across facilities</li>
            <li>Manage warehouse operations and logistics</li>
            <li>Generate revenue reports from storage services</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageDashboard;
