import React from "react";
import { useStorage } from "./StorageContext";

export default function FacilityPerformanceTable() {
  const { facilities, fetchFacilities } = useStorage();

  console.log("FacilityPerformanceTable rendering with facilities:", facilities);

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Facility performance</h5>
            <small className="text-muted">Utilization, throughput, and alerts</small>
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => fetchFacilities()}
          >
            🔄 Refresh
          </button>
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
                const totalCapacity = Number(facility.capacity_t) || 0;
                const usedCapacity = Number(facility.used_t) || 0;
                const availableCapacity = Number(facility.available_t) || 0;
                const utilization =
                  totalCapacity > 0
                    ? Math.round((usedCapacity / totalCapacity) * 100)
                    : 0;

                // Debug individual facility data
                console.log(`Facility: ${facility.name}`, {
                  id: facility.id,
                  capacity_t: facility.capacity_t,
                  used_t: facility.used_t,
                  available_t: facility.available_t,
                  calculated_utilization: utilization
                });

                // Determine color based on utilization
                let barColor = "bg-success";
                if (utilization > 90) {
                  barColor = "bg-danger";
                } else if (utilization > 70) {
                  barColor = "bg-warning";
                }

                return (
                  <tr key={facility.id}>
                    <td>
                      <div className="fw-semibold">{facility.name}</div>
                      <small className="text-muted">{facility.location}</small>
                    </td>
                    <td>{totalCapacity.toFixed(1)} t</td>
                    <td>
                      <span className={utilization > 90 ? "text-danger fw-semibold" : ""}>
                        {availableCapacity.toFixed(1)} t
                      </span>
                    </td>
                    <td>
                      <div className="progress" style={{ height: 10, borderRadius: 999, backgroundColor: "#e9ecef" }}>
                        <div
                          className={`progress-bar ${barColor}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                          title={`Used: ${usedCapacity.toFixed(1)}t / ${totalCapacity.toFixed(1)}t`}
                        ></div>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        {utilization}% filled ({usedCapacity.toFixed(1)}t used)
                      </small>
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
