import React from "react";

export default function OverviewDashboard({ facility, productionStats, inventoryTotal, procurementTotal, incomingTotal }) {
  if (!facility) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card shadow-sm border-0" style={{ borderRadius: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <div className="card-body text-white">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small opacity-75 mb-1">Factory Capacity</div>
                <div className="fs-3 fw-bold">{facility.daily_capacity_t.toFixed(0)}</div>
                <div className="small opacity-75">tons/day</div>
              </div>
              <i className="bi bi-speedometer2 fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card shadow-sm border-0" style={{ borderRadius: 12, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <div className="card-body text-white">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small opacity-75 mb-1">Current Inventory</div>
                <div className="fs-3 fw-bold">{inventoryTotal.toFixed(1)}</div>
                <div className="small opacity-75">tons in stock</div>
              </div>
              <i className="bi bi-box-seam fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card shadow-sm border-0" style={{ borderRadius: 12, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
          <div className="card-body text-white">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small opacity-75 mb-1">Available to Procure</div>
                <div className="fs-3 fw-bold">{procurementTotal.toFixed(1)}</div>
                <div className="small opacity-75">tons in storage</div>
              </div>
              <i className="bi bi-cart3 fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card shadow-sm border-0" style={{ borderRadius: 12, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
          <div className="card-body text-white">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small opacity-75 mb-1">Incoming Goods</div>
                <div className="fs-3 fw-bold">{incomingTotal}</div>
                <div className="small opacity-75">shipments in transit</div>
              </div>
              <i className="bi bi-truck fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {productionStats && (
        <>
          <div className="col-md-3">
            <div className="card shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <div className="small text-muted mb-1">
                  <i className="bi bi-box-fill me-1"></i>
                  Raw Material Used
                </div>
                <div className="fs-4 fw-bold text-primary">{productionStats.total_raw_material_t.toFixed(1)}t</div>
                <div className="small text-muted">This {productionStats.period}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <div className="small text-muted mb-1">
                  <i className="bi bi-droplet-fill me-1"></i>
                  Oil Extracted
                </div>
                <div className="fs-4 fw-bold text-success">{productionStats.total_oil_extracted_t.toFixed(1)}t</div>
                <div className="small text-muted">This {productionStats.period}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <div className="small text-muted mb-1">
                  <i className="bi bi-percent me-1"></i>
                  Extraction Rate
                </div>
                <div className="fs-4 fw-bold text-info">{productionStats.average_extraction_rate.toFixed(1)}%</div>
                <div className="small text-muted">Average efficiency</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <div className="small text-muted mb-1">
                  <i className="bi bi-speedometer me-1"></i>
                  Capacity Utilization
                </div>
                <div className="fs-4 fw-bold text-warning">{productionStats.capacity_utilization.toFixed(1)}%</div>
                <div className="small text-muted">Factory capacity</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
