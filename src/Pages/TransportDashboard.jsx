import React from "react";
import { TransportProvider, useTransport } from "../Components/Transport/TransportContext";
import VehicleRegistrationForm from "../Components/Transport/VehicleRegistrationForm";
import VehicleList from "../Components/Transport/VehicleList";
import TransportRequestsBoard from "../Components/Transport/TransportRequestsBoard";

function TransportDashboardView() {
  const { vehicles } = useTransport();
  return (
    <div className="container py-4">
      <style>
        {`
          .transport-hero {
            background: linear-gradient(135deg, #0f9d58, #0b8043);
            color: white;
            border-radius: 24px;
          }
        `}
      </style>
      <div className="transport-hero p-4 p-md-5 mb-4 shadow-sm">
        <div className="row g-4 align-items-center">
          <div className="col-md-8">
            <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.1em", opacity: 0.7 }}>
              Transport command
            </p>
            <h2 className="fw-bold mb-2">Register & monitor fleet capacity</h2>
            <p className="mb-0">
              Add vetted drivers, capture vehicle specs, and keep a live snapshot of capacity available for
              storage and trading assignments.
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="display-6 fw-bold">Fleet</div>
            <small style={{ opacity: 0.8 }}>Powered logistics layer</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <VehicleRegistrationForm />
        </div>
        <div className="col-lg-7">
          <VehicleList />
        </div>
      </div>
      <TransportRequestsBoard vehicles={vehicles} />
    </div>
  );
}

export default function TransportDashboard() {
  return (
    <TransportProvider>
      <TransportDashboardView />
    </TransportProvider>
  );
}
