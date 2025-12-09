import React from "react";
import { useNavigate } from "react-router-dom";
import StorageProvider from "../Components/Storage-components/StorageContext";
import StorageFacilityForm from "../Components/Storage-components/StorageFacilityForm";

function RegisterFacilityView() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate('/storage-dashboard')}
          >
            ← Back to Dashboard
          </button>
          <div
            className="p-4 text-white rounded-4 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
            }}
          >
            <h2 className="fw-bold mb-1">Register Storage Facility</h2>
            <p className="mb-0">
              Add new storage facilities to your network. Registered facilities will be available for booking and capacity management.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 mx-auto">
          <StorageFacilityForm />
        </div>
        <div className="col-lg-4 mx-auto">
          <div className="card shadow-sm h-100 rounded-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Why register facilities?</h5>
              <p className="text-muted mb-3">
                Onboarded warehouses appear across the value chain, enabling precision routing of
                harvest lots, real-time utilization tracking, and policy-facing visibility.
              </p>
              <ul className="text-muted small mb-0">
                <li className="mb-2">Unlock farmer self-service booking with validated capacity</li>
                <li className="mb-2">Feed AI models that forecast congestion and spoilage risk</li>
                <li className="mb-2">Expose sensor + compliance metadata for traceability</li>
                <li className="mb-2">Enable incentive payouts tied to turnaround and loss reduction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterFacility() {
  return (
    <StorageProvider>
      <RegisterFacilityView />
    </StorageProvider>
  );
}
