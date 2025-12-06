import React from 'react';
import authService from '../services/authService';
import AIAdvisoryBanner from '../Components/Common/AIAdvisoryBanner';

const RetailerDashboard = () => {
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
        <h2 className="mb-2">Welcome, {user?.name || 'Retailer'}!</h2>
        <p className="lead mb-0">Role: Retailer / खुदरा विक्रेता</p>
      </div>

      {/* Simple info card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-shop me-2"></i>
            Retailer Dashboard
          </h5>
          <p className="card-text">
            Your personalized retailer dashboard is under development. Soon you will be able to:
          </p>
          <ul>
            <li>Track total sales and inventory levels</li>
            <li>Manage customer relationships and orders</li>
            <li>Monitor revenue and profitability</li>
            <li>Connect with manufacturers and suppliers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
