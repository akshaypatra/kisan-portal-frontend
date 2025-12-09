import React from "react";

export default function OperationsInsightsCard({
  facility,
  productionStats,
  inventoryTotal,
  procurementTotal,
  incomingTotal,
}) {
  const capacity = facility?.daily_capacity_t;
  const utilization = productionStats?.capacity_utilization;
  const totalRaw = productionStats?.total_raw_material_t;
  const totalOil = productionStats?.total_oil_extracted_t;
  const extraction = productionStats?.average_extraction_rate;

  const capacityCopy = capacity ? `${capacity.toFixed(0)} t/day` : "Capacity pending";
  const utilizationCopy = utilization !== undefined && utilization !== null ? `${utilization.toFixed(1)}% utilized` : "Utilization pending";

  const projectedThroughput =
    capacity && utilization !== undefined && utilization !== null
      ? `${(capacity * (utilization / 100)).toFixed(1)} t/day at current run-rate`
      : null;

  let stockAlert = "Awaiting stock data";
  if (capacity && inventoryTotal !== undefined && inventoryTotal !== null) {
    const ratio = inventoryTotal / capacity;
    if (ratio < 0.5) stockAlert = "Low stock — plan procurement";
    else if (ratio < 1.2) stockAlert = "Healthy buffer";
    else stockAlert = "High stock — prioritize dispatch";
  }

  const supplierSnapshot =
    procurementTotal !== undefined && procurementTotal !== null ? `${procurementTotal.toFixed(1)}t ready in storage` : "Storage data pending";
  const incomingCopy = incomingTotal ? `${incomingTotal} lots en route` : "No lots in transit";
  const productionSummary =
    capacity && utilization !== undefined && utilization !== null
      ? `Capacity (${capacity.toFixed(0)}t/day) × utilization (${utilization.toFixed(1)}%)`
      : "Capacity × utilization when data is available";
  const supplySummary =
    capacity && inventoryTotal !== undefined
      ? `Stock buffer = inventory (${inventoryTotal.toFixed(1)}t) ÷ capacity (${capacity.toFixed(0)}t/day)`
      : "Stock buffer once inventory + capacity are loaded";
  const biddingSummary = "Live bids → counter-bid → auto-match best price/location";

  return (
    <div className="card ops-card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <div className="small text-uppercase text-muted fw-semibold">Operations cockpit</div>
            <h5 className="mb-0">Production, Supply, and Bidding at a glance</h5>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
              <div className="ops-section h-100">
              <div className="d-flex align-items-center mb-3">
                <span className="ops-icon bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-speedometer2"></i>
                </span>
                <div>
                  <div className="fw-semibold">Production Insights</div>
                  <div className="text-muted small">Grouped factory numbers</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Capacity</div>
                <div className="fw-semibold">{capacityCopy}</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Utilization</div>
                <div className="fw-semibold">{utilizationCopy}</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Output forecast</div>
                <div className="fw-semibold">{projectedThroughput || "Auto-forecast after first run"}</div>
              </div>
              <div className="text-muted small ops-note">
                {productionSummary}
                {extraction ? ` · Extraction ${extraction.toFixed(1)}%` : ""}
                {totalRaw !== undefined && totalOil !== undefined
                  ? ` · Raw ${totalRaw.toFixed(1)}t → Oil ${totalOil.toFixed(1)}t`
                  : ""}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="ops-section h-100">
              <div className="d-flex align-items-center mb-3">
                <span className="ops-icon bg-success bg-opacity-10 text-success">
                  <i className="bi bi-truck"></i>
                </span>
                <div>
                  <div className="fw-semibold">Supply Insights</div>
                  <div className="text-muted small">Stock + shipments grouped</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Inventory in factory</div>
                <div className="fw-semibold">{inventoryTotal !== undefined ? `${inventoryTotal.toFixed(1)} t` : "Loading"}</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Ready in storage</div>
                <div className="fw-semibold">{procurementTotal !== undefined ? `${procurementTotal.toFixed(1)} t` : "Loading"}</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Lots incoming</div>
                <div className="fw-semibold">{incomingCopy}</div>
              </div>
              <div className="text-muted small ops-note">{supplySummary} · Alert: {stockAlert}</div>
            </div>
          </div>

          <div className="col-md-4">
              <div className="ops-section h-100">
              <div className="d-flex align-items-center mb-3">
                <span className="ops-icon bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-cash-coin"></i>
                </span>
                <div>
                  <div className="fw-semibold">Bid &amp; Buy From Farmers</div>
                  <div className="text-muted small d-flex align-items-center gap-2">
                    <span className="ops-live-dot"></span>
                    Live marketplace · auto-refreshes every minute
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Live bids</div>
                <div className="fw-semibold">Streaming farmer/FPO offers in real-time</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Counter-bid</div>
                <div className="fw-semibold">Respond fast on price/quantity before offers expire</div>
              </div>
              <div className="mb-2">
                <div className="small text-muted">Auto-match</div>
                <div className="fw-semibold">Best price + nearest location; closes stale offers</div>
              </div>
              <div className="text-muted small ops-note">{biddingSummary}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
