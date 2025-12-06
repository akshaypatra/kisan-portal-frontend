import React from 'react';
import authService from '../services/authService';
import AIAdvisoryBanner from '../Components/Common/AIAdvisoryBanner';

const ManufacturerDashboard = () => {
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
        <h2 className="mb-2">Welcome, {user?.name || 'Manufacturer'}!</h2>
        <p className="lead mb-0">Role: Manufacturer / निर्माता</p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-gear-fill me-2"></i>
            Manufacturer Dashboard
          </h5>
          <p className="card-text">
            Your personalized manufacturer dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>Monitor production volume and throughput</li>
            <li>Track raw material inventory and stock levels</li>
            <li>Manage finished goods and order fulfillment</li>
            <li>Coordinate with suppliers and distributors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
