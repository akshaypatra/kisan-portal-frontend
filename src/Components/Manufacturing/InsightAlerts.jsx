import React from "react";

export default function InsightAlerts({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="row g-3 mb-3">
      {alerts.map((alert) => (
        <div className="col-md-6 col-lg-4" key={alert.id}>
          <div className={`insight-alert ${alert.type === "up" ? "up" : "down"}`}>
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex align-items-start gap-2">
                <div className={`insight-badge ${alert.type === "up" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                  <i className={`bi ${alert.type === "up" ? "bi-arrow-up-right" : "bi-arrow-down-right"}`}></i>
                </div>
                <div>
                  <div className="fw-semibold">{alert.title}</div>
                  <div className="small text-muted">{alert.message}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-muted text-decoration-none"
                onClick={() => onDismiss(alert.id)}
                aria-label="Dismiss alert"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
