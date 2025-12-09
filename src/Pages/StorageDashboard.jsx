import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import StorageProvider from "../Components/Storage-components/StorageContext";
import StorageSummaryCards from "../Components/Storage-components/StorageSummaryCards";
import FacilityPerformanceTable from "../Components/Storage-components/FacilityPerformanceTable";
import StorageRequestsBoard from "../Components/Storage-components/StorageRequestsBoard";
import StorageInventoryBoard from "../Components/Storage-components/StorageInventoryBoard";
import StorageAlertCenter from "../Components/Storage-components/StorageAlertCenter";
import StorageTaskPanel from "../Components/Storage-components/StorageTaskPanel";
import StorageInsights from "../Components/Storage-components/StorageInsights";
import StorageIntakeCard from "../Components/Storage-components/StorageIntakeCard";
import StorageIncomingBoard from "../Components/Storage-components/StorageIncomingBoard";
import AIAdvisoryBanner from "../Components/Common/AIAdvisoryBanner";

function StorageDashboardView() {
  const user = authService.getStoredUser();
  const navigate = useNavigate();

  return (
    <div className="storage-dashboard container py-4">
      <AIAdvisoryBanner />
      <style>
        {`
        .storage-dashboard {
          background: linear-gradient(180deg, #f0f9f4 0%, #ffffff 50%);
          min-height: calc(100vh - 80px);
        }
        `}
      </style>

      <div
        className="p-4 mb-4 text-white rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="text-uppercase small" style={{ opacity: 0.8 }}>
              Storage Network Control
            </div>
            <h2 className="fw-bold mb-1">Welcome, {user?.name || "Storage Manager"}</h2>
            <p className="mb-0">
              Monitor utilization, requests, alerts, and logistics in one place.
            </p>
          </div>
          <div className="text-end">
            <div className="fs-1 fw-bold">Live</div>
            <small style={{ opacity: 0.7 }}>Updated just now</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100 rounded-4 border-0">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-5">
              <div className="mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #2e7d32, #1b5e20)'
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🏭</span>
                </div>
                <h4 className="fw-bold mb-2">Expand Your Network</h4>
                <p className="text-muted mb-0">
                  Register new storage facilities to increase capacity and reach
                </p>
              </div>
              <button
                className="btn btn-lg btn-success px-5 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                  border: 'none'
                }}
                onClick={() => navigate('/register-facility')}
              >
                <span className="me-2">➕</span>
                Register Storage Facility
              </button>
              <small className="text-muted mt-3">
                Add warehouses, cold storage, and distribution centers
              </small>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <StorageIntakeCard />
        </div>
      </div>

      <StorageSummaryCards />

      <div className="row g-4 mb-4">
        <div className="col-lg-12">
          <StorageIncomingBoard />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <FacilityPerformanceTable />
        </div>
        <div className="col-lg-5">
          <StorageRequestsBoard />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <StorageInventoryBoard />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <StorageTaskPanel />
        </div>
        <div className="col-lg-8">
          <StorageInsights />
        </div>
      </div>
    </div>
  );
}

export default function StorageDashboard() {
  return (
    <StorageProvider>
      <StorageDashboardView />
    </StorageProvider>
  );
}
