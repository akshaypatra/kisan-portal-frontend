import React from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import { useStorage } from "./StorageContext";

const severityColor = {
  high: "bg-danger-subtle text-danger",
  medium: "bg-warning-subtle text-warning",
  low: "bg-success-subtle text-success",
};

export default function StorageAlertCenter() {
  const { alerts, acknowledgeAlert } = useStorage();

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaBell /> Alert center
            </h5>
            <small className="text-muted">Resolve sensor and compliance issues</small>
          </div>
          <span className="badge bg-danger-subtle text-danger">
            {alerts.filter((alert) => !alert.acknowledged).length} open
          </span>
        </div>

        <div className="d-flex flex-column gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="border rounded-4 p-3"
              style={{ borderColor: "#fdecea", background: "#fff" }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-semibold">{alert.type}</div>
                  <small className="text-muted">{alert.facilityName}</small>
                </div>
                <span className={`badge ${severityColor[alert.severity]}`}>{alert.severity}</span>
              </div>
              <p className="small mb-2">{alert.message}</p>
              <div className="d-flex justify-content-between align-items-center small text-muted">
                <span>{new Date(alert.timestamp).toLocaleString()}</span>
                <button
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  disabled={alert.acknowledged}
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  <FaCheck /> {alert.acknowledged ? "Resolved" : "Acknowledge"}
                </button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center text-muted py-4">No alerts on the network.</div>
          )}
        </div>
      </div>
    </div>
  );
}
