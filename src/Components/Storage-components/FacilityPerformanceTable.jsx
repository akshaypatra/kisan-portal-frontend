import React from "react";
import { useStorage } from "./StorageContext";

export default function FacilityPerformanceTable() {
  const { facilities } = useStorage();

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Facility performance</h5>
            <small className="text-muted">Utilization, throughput, and alerts</small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Facility</th>
                <th>Capacity (t)</th>
                <th>Available (t)</th>
                <th>Utilization</th>
                <th>Services</th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => {
                const utilization =
                  facility.capacity_t > 0
                    ? Math.round(((facility.capacity_t - facility.available_t) / facility.capacity_t) * 100)
                    : 0;
                return (
                  <tr key={facility.id}>
                    <td>
                      <div className="fw-semibold">{facility.name}</div>
                      <small className="text-muted">{facility.location}</small>
                    </td>
                    <td>{facility.capacity_t}</td>
                    <td>{facility.available_t}</td>
                    <td>
                      <div className="progress" style={{ height: 8, borderRadius: 999 }}>
                        <div
                          className={`progress-bar ${utilization > 80 ? "bg-danger" : "bg-success"}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{utilization}%</small>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {facility.services.slice(0, 3).map((service) => (
                          <span key={service} className="badge bg-light text-muted">
                            {service}
                          </span>
                        ))}
                        {facility.services.length > 3 && (
                          <span className="badge bg-light text-muted">
                            +{facility.services.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          facility.alerts > 0 ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                        }`}
                      >
                        {facility.alerts} open
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
