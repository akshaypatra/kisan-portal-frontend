import React, { useEffect, useState, useMemo } from "react";
import manufacturingService from "../../services/manufacturingService";

const BUCKETS = [
  { label: "0-6h", max: 6 },
  { label: "6-12h", max: 12 },
  { label: "12-18h", max: 18 },
  { label: "18-24h", max: 24 },
];

function bucketColor(count) {
  if (count === 0) return "bg-secondary text-white";
  if (count >= 5) return "bg-danger text-white";
  if (count >= 3) return "bg-warning text-dark";
  return "bg-success text-white";
}

export default function IncomingGoodsBoard({ facilityId, onDataLoaded }) {
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIncoming();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadIncoming, 30000);
    return () => clearInterval(interval);
  }, [facilityId]);

  const loadIncoming = async () => {
    if (!facilityId) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await manufacturingService.getIncomingGoods(facilityId);
      setIncoming(Array.isArray(data) ? data : []);
      console.log("Incoming goods loaded:", data);
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error("Error loading incoming goods:", err);
      setError(err?.response?.data?.detail || "Failed to load incoming goods");
    } finally {
      setLoading(false);
    }
  };

  const { buckets, groupedItems } = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    const items = [];

    incoming.forEach((item) => {
      const etaHours = item.eta_hours;
      let bucketIndex = null;

      if (etaHours !== null && etaHours !== undefined) {
        if (etaHours <= 6) bucketIndex = 0;
        else if (etaHours <= 12) bucketIndex = 1;
        else if (etaHours <= 18) bucketIndex = 2;
        else if (etaHours <= 24) bucketIndex = 3;

        if (bucketIndex !== null) {
          buckets[bucketIndex]++;
        }
      }

      items.push({
        ...item,
        bucketIndex,
      });
    });

    // Sort by ETA (soonest first)
    items.sort((a, b) => {
      if (a.eta_hours === null) return 1;
      if (b.eta_hours === null) return -1;
      return a.eta_hours - b.eta_hours;
    });

    return { buckets, groupedItems: items };
  }, [incoming]);

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Incoming Raw Materials</h5>
            <small className="text-muted">Goods in transit to factory</small>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={loadIncoming} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="alert alert-warning py-2">{error}</div>}

        {/* ETA Buckets */}
        <div className="d-flex gap-2 mb-3">
          {BUCKETS.map((b, idx) => (
            <div
              key={b.label}
              className={`px-3 py-2 rounded flex-fill text-center ${bucketColor(buckets[idx])}`}
            >
              <div className="fw-bold mb-0">{b.label}</div>
              <div className="small mb-0">{buckets[idx]} load(s)</div>
            </div>
          ))}
        </div>

        {/* Incoming Bookings Table */}
        {!loading && groupedItems.length === 0 && (
          <div className="alert alert-light border py-2">
            No incoming goods at this time.
          </div>
        )}

        {groupedItems.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>From</th>
                  <th>Farmer</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Distance</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((item) => (
                  <tr key={item.booking_id}>
                    <td className="small fw-semibold">#{item.booking_id}</td>
                    <td className="small">{item.crop_name}</td>
                    <td>
                      <span className="badge bg-primary">{item.quantity_t.toFixed(1)}t</span>
                    </td>
                    <td className="small text-muted">{item.pickup_location}</td>
                    <td className="small">{item.farmer_name}</td>
                    <td className="small">{item.vehicle_number || "Pending"}</td>
                    <td>
                      <span className="badge bg-info">{item.status}</span>
                    </td>
                    <td className="small">{item.distance_km.toFixed(0)} km</td>
                    <td className="small">
                      {item.eta_hours !== null && item.eta_hours !== undefined ? (
                        <strong className="text-success">{item.eta_hours.toFixed(1)}h</strong>
                      ) : (
                        <span className="text-muted">Unknown</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
