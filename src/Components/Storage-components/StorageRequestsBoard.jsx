import React from "react";
import { FaCheck, FaClock, FaTruck } from "react-icons/fa";
import { useStorage } from "./StorageContext";

const statusColors = {
  Queued: "bg-secondary-subtle text-secondary",
  Scheduled: "bg-info-subtle text-info",
  Approved: "bg-primary-subtle text-primary",
  "In transit": "bg-warning-subtle text-warning",
};

export default function StorageRequestsBoard() {
  const { requests, facilities, updateRequestStatus } = useStorage();

  const facilityNameMap = facilities.reduce((acc, facility) => {
    acc[facility.id] = facility.name;
    return acc;
  }, {});

  const nextStatus = {
    Queued: "Approved",
    Approved: "Scheduled",
    Scheduled: "In transit",
  };

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Storage requests</h5>
            <small className="text-muted">Approve and schedule farmer consignments</small>
          </div>
          <span className="badge bg-light text-dark">{requests.length} open</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-4 p-3 d-flex justify-content-between align-items-center"
              style={{ borderColor: "#edf3ef" }}
            >
              <div>
                <div className="fw-semibold">
                  {request.crop} • {request.quantity_t} t
                </div>
                <div className="text-muted small">
                  {request.farmer} → {facilityNameMap[request.facilityId] || "Unknown facility"}
                </div>
                <div className="text-muted small d-flex align-items-center gap-1">
                  <FaClock /> Preferred date {request.preferredDate}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${statusColors[request.status] || "bg-light text-dark"}`}>
                  {request.status}
                </span>
                {nextStatus[request.status] && (
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => updateRequestStatus(request.id, nextStatus[request.status])}
                  >
                    {nextStatus[request.status] === "In transit" ? <FaTruck /> : <FaCheck />}
                    {nextStatus[request.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center text-muted py-4">No new requests at the moment.</div>
          )}
        </div>
      </div>
    </div>
  );
}
