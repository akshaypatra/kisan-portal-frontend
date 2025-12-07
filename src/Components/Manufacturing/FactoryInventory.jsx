import React, { useEffect, useState } from "react";
import manufacturingService from "../../services/manufacturingService";

export default function FactoryInventory({ facilityId, onDataLoaded }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInventory();
  }, [facilityId]);

  const loadInventory = async () => {
    if (!facilityId) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await manufacturingService.getInventory(facilityId);
      setInventory(Array.isArray(data) ? data : []);
      console.log("Factory inventory loaded:", data);
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError(err?.response?.data?.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const totalInventory = inventory.reduce((sum, item) => sum + (item.quantity_t || 0), 0);

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Current Factory Inventory</h5>
            <small className="text-muted">Raw material stock levels</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="text-end">
              <div className="small text-muted">Total Stock</div>
              <div className="fw-bold fs-5 text-primary">{totalInventory.toFixed(1)} tons</div>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={loadInventory} disabled={loading}>
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-warning py-2">{error}</div>}

        {!loading && inventory.length === 0 && (
          <div className="alert alert-light border py-2">
            No inventory in stock. Procure raw materials to begin production.
          </div>
        )}

        {inventory.length > 0 && (
          <div className="row g-3">
            {inventory.map((item, idx) => {
              const stockPercentage = (item.quantity_t / totalInventory) * 100;
              const stockLevel =
                item.quantity_t > 50
                  ? "bg-success"
                  : item.quantity_t > 20
                  ? "bg-warning"
                  : "bg-danger";

              return (
                <div key={idx} className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">{item.crop_name}</h6>
                          <small className="text-muted">Raw Material</small>
                        </div>
                        <div className="text-end">
                          <div className="fs-4 fw-bold text-primary">{item.quantity_t.toFixed(1)}</div>
                          <div className="small text-muted">tons</div>
                        </div>
                      </div>

                      <div className="progress mb-2" style={{ height: "8px" }}>
                        <div
                          className={`progress-bar ${stockLevel}`}
                          role="progressbar"
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        ></div>
                      </div>

                      <div className="small text-muted">
                        <i className="bi bi-clock-history me-1"></i>
                        Updated: {new Date(item.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
