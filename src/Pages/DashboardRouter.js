import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const DashboardRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const user = authService.getStoredUser();

    if (!user || !user.role) {
      // If no user or role, redirect to login
      navigate('/login');
      return;
    }

    // Route based on user role
    switch (user.role) {
      case 'farmer':
        navigate('/dashboard');
        break;
      case 'seed_seller':
        navigate('/seed-seller');
        break;
      case 'fpo':
        navigate('/fpo-dashboard');
        break;
      case 'trader':
        navigate('/trader-dashboard');
        break;
      case 'transport':
        navigate('/transport-dashboard');
        break;
      case 'storage':
        navigate('/storage-dashboard');
        break;
      case 'manufacturer':
        // console.log("wtf u doing");
        navigate('/manufacturer-dashboard');
        break;
      case 'retailer':
        navigate('/retailer-dashboard');
        break;
      case 'policy_maker':
        navigate('/policy-maker-dashboard');
        break;
      default:
        // Unknown role, redirect to login
        navigate('/login');
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardRouter;
