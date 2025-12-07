import React from "react";
import authService from "../services/authService";
import StorageProvider from "../Components/Storage-components/StorageContext";
import StorageSummaryCards from "../Components/Storage-components/StorageSummaryCards";
import FacilityPerformanceTable from "../Components/Storage-components/FacilityPerformanceTable";
import StorageRequestsBoard from "../Components/Storage-components/StorageRequestsBoard";
import StorageInventoryBoard from "../Components/Storage-components/StorageInventoryBoard";
import StorageAlertCenter from "../Components/Storage-components/StorageAlertCenter";
import StorageTaskPanel from "../Components/Storage-components/StorageTaskPanel";
import StorageInsights from "../Components/Storage-components/StorageInsights";
import StorageFacilityForm from "../Components/Storage-components/StorageFacilityForm";
import StorageIntakeCard from "../Components/Storage-components/StorageIntakeCard";
import StorageIncomingBoard from "../Components/Storage-components/StorageIncomingBoard";
import AIAdvisoryBanner from "../Components/Common/AIAdvisoryBanner";

function StorageDashboardView() {
  const user = authService.getStoredUser();

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
          <StorageFacilityForm />
        </div>
        <div className="col-lg-7">
          <div className="card shadow-sm h-100 rounded-4">
            <div className="card-body">
              <h5>Why register facilities?</h5>
              <p className="text-muted mb-3">
                Onboarded warehouses appear across the value chain, enabling precision routing of
                harvest lots, real-time utilization tracking, and policy-facing visibility.
              </p>
              <ul className="text-muted small mb-0">
                <li>Unlock farmer self-service booking with validated capacity</li>
                <li>Feed AI models that forecast congestion and spoilage risk</li>
                <li>Expose sensor + compliance metadata for traceability</li>
                <li>Enable incentive payouts tied to turnaround and loss reduction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <StorageSummaryCards />

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <StorageIntakeCard />
        </div>
        <div className="col-lg-6">
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
