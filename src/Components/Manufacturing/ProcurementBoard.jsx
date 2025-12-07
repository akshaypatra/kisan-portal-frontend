import React, { useEffect, useState } from "react";
import manufacturingService from "../../services/manufacturingService";

export default function ProcurementBoard({ facilityId, onDataLoaded }) {
  const [procurementData, setProcurementData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [procuringFrom, setProcuringFrom] = useState(null);
  const [procureQty, setProcureQty] = useState("");
  const [procuring, setProcuring] = useState(false);

  useEffect(() => {
    loadProcurementBoard();
  }, [facilityId]);

  const loadProcurementBoard = async () => {
    if (!facilityId) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await manufacturingService.getProcurementBoard(facilityId);
      setProcurementData(data);
      console.log("Procurement board loaded:", data);

      // Pass data to parent component for map
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error("Error loading procurement board:", err);
      setError(err?.response?.data?.detail || "Failed to load procurement data");
    } finally {
      setLoading(false);
    }
  };

  const handleProcure = (storage, cropName) => {
    setProcuringFrom({ ...storage, crop_name: cropName });
    setProcureQty(storage.available_quantity_t.toString());
  };

  const submitProcurement = async () => {
    if (!procuringFrom || !procureQty) return;

    setProcuring(true);
    try {
      const payload = {
        storage_facility_id: procuringFrom.storage_facility_id,
        crop_name: procuringFrom.crop_name,
        quantity_requested_t: parseFloat(procureQty),
      };

      await manufacturingService.createProcurementOrder(facilityId, payload);

      alert(`Procurement order created successfully for ${procureQty}t of ${procuringFrom.crop_name}!`);

      // Close modal and refresh
      setProcuringFrom(null);
      setProcureQty("");
      loadProcurementBoard();
    } catch (err) {
      console.error("Error creating procurement order:", err);
      alert(err?.response?.data?.detail || "Failed to create procurement order");
    } finally {
      setProcuring(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Available Seeds for Procurement</h5>
              <small className="text-muted">Within procurement radius</small>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={loadProcurementBoard} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="alert alert-warning py-2">{error}</div>}

          {!loading && procurementData.length === 0 && (
            <div className="alert alert-light border py-2">
              No seeds available for procurement at this time.
            </div>
          )}

          <div className="d-flex flex-column gap-3">
            {procurementData.map((crop, idx) => (
              <div key={idx} className="border rounded-3 p-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="mb-1 fw-bold">{crop.crop_name}</h6>
                    <div className="d-flex gap-3 small text-muted">
                      <span>
                        <i className="bi bi-box-seam me-1"></i>
                        In Storage: <strong className="text-success">{crop.in_storage_total_t.toFixed(1)} tons</strong>
                      </span>
                      <span>
                        <i className="bi bi-scissors me-1"></i>
                        Being Harvested: <strong className="text-info">{crop.being_harvested_total_t.toFixed(1)} tons</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Storage Locations */}
                {crop.storage_locations && crop.storage_locations.length > 0 && (
                  <div className="mb-3">
                    <div className="small fw-semibold mb-2 text-muted">
                      <i className="bi bi-building me-1"></i>
                      Storage Facilities ({crop.storage_locations.length})
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>Facility</th>
                            <th>Location</th>
                            <th>Available</th>
                            <th>Distance</th>
                            <th>ETA</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crop.storage_locations.map((storage, sidx) => (
                            <tr key={sidx}>
                              <td className="small fw-semibold">{storage.storage_facility_name}</td>
                              <td className="small text-muted">
                                {storage.city}, {storage.state}
                              </td>
                              <td>
                                <span className="badge bg-success">{storage.available_quantity_t.toFixed(1)}t</span>
                              </td>
                              <td className="small">{storage.distance_km.toFixed(0)} km</td>
                              <td className="small">{storage.eta_hours.toFixed(1)}h</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleProcure(storage, crop.crop_name)}
                                >
                                  Procure
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Harvesting Farmers */}
                {crop.harvesting_farmers && crop.harvesting_farmers.length > 0 && (
                  <div>
                    <div className="small fw-semibold mb-2 text-muted">
                      <i className="bi bi-person-badge me-1"></i>
                      Farmers Currently Harvesting ({crop.harvesting_farmers.length})
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>Farmer</th>
                            <th>Plot</th>
                            <th>Quantity</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crop.harvesting_farmers.map((farmer, fidx) => (
                            <tr key={fidx}>
                              <td className="small fw-semibold">{farmer.farmer_name}</td>
                              <td className="small text-muted">{farmer.plot_name}</td>
                              <td>
                                <span className="badge bg-info">{farmer.quantity_t.toFixed(1)}t</span>
                              </td>
                              <td>
                                <span className={`badge ${farmer.status === 'harvested' ? 'bg-success' : 'bg-warning'}`}>
                                  {farmer.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Future Forecast */}
                {(crop.forecast_next_month_t > 0 || crop.forecast_next_3_months_t > 0 || crop.forecast_end_of_season_t > 0) && (
                  <div className="mt-3 p-2 bg-light rounded">
                    <div className="small fw-semibold mb-2">
                      <i className="bi bi-calendar3 me-1"></i>
                      Harvest Forecast
                    </div>
                    <div className="d-flex gap-3 small">
                      {crop.forecast_next_month_t > 0 && (
                        <div>
                          <span className="text-muted">Next Month:</span>{" "}
                          <strong className="text-primary">{crop.forecast_next_month_t.toFixed(1)}t</strong>
                        </div>
                      )}
                      {crop.forecast_next_3_months_t > 0 && (
                        <div>
                          <span className="text-muted">Next 3 Months:</span>{" "}
                          <strong className="text-primary">{crop.forecast_next_3_months_t.toFixed(1)}t</strong>
                        </div>
                      )}
                      {crop.forecast_end_of_season_t > 0 && (
                        <div>
                          <span className="text-muted">End of Season:</span>{" "}
                          <strong className="text-primary">{crop.forecast_end_of_season_t.toFixed(1)}t</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Procurement Modal */}
      {procuringFrom && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setProcuringFrom(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-cart-plus me-2"></i>
                  Create Procurement Order
                </h5>
                <button type="button" className="btn-close" onClick={() => setProcuringFrom(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Storage Facility</label>
                  <p className="mb-0">{procuringFrom.storage_facility_name}</p>
                  <small className="text-muted">{procuringFrom.city}, {procuringFrom.state}</small>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Crop</label>
                  <p className="mb-0">{procuringFrom.crop_name}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Available Quantity</label>
                  <p className="mb-0 text-success">{procuringFrom.available_quantity_t.toFixed(1)} tons</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Distance & ETA</label>
                  <p className="mb-0">{procuringFrom.distance_km.toFixed(0)} km • ETA: {procuringFrom.eta_hours.toFixed(1)} hours</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Quantity to Procure (tons) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={procureQty}
                    onChange={(e) => setProcureQty(e.target.value)}
                    step="0.1"
                    min="0.1"
                    max={procuringFrom.available_quantity_t}
                    placeholder="Enter quantity"
                  />
                  <small className="text-muted">Max: {procuringFrom.available_quantity_t.toFixed(1)} tons</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setProcuringFrom(null)} disabled={procuring}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submitProcurement} disabled={procuring || !procureQty}>
                  {procuring ? "Creating Order..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
