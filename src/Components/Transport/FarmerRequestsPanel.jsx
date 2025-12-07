import React, { useEffect, useState } from "react";
import transportService from "../../services/transportService";

function StatusBadge({ status }) {
  const styles = {
    new: "bg-warning text-dark",
    accepted: "bg-success text-white",
    completed: "bg-secondary text-white",
    cancelled: "bg-light text-dark",
  };
  const cls = styles[status] || "bg-light text-dark";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function FarmerRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await transportService.listBookings();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const payForBooking = async (bookingId) => {
    setPayingId(bookingId);
    setError("");
    try {
      const { data } = await transportService.markPaid(bookingId);
      setRequests((prev) => prev.map((r) => (r.id === bookingId ? data : r)));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || "Could not mark payment";
      setError(msg);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Your transport requests</h6>
          <button className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {error && <div className="alert alert-warning py-2">{error}</div>}
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Crops / qty</th>
                <th>Drop</th>
                <th>Ship</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted text-center">
                    No requests yet.
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    {Array.isArray(r.goods_details) && r.goods_details.length > 0
                      ? r.goods_details.map((g) => `${g.name} (${g.quantity})`).join(", ")
                      : `${r.crop_name || "-"} (${r.quantity})`}
                  </td>
                  <td>{r.drop_location || "-"}</td>
                  <td>
                    {r.shipping_date || "-"} @ {r.shipping_time || "-"}
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    {r.payment_status === "paid" ? (
                      <span className="badge bg-success text-white">Paid</span>
                    ) : (r.intake_status === "arrived" || r.intake_status === "stored" || r.arrival_verified) ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        disabled={payingId === r.id}
                        onClick={() => payForBooking(r.id)}
                      >
                        {payingId === r.id ? "Paying..." : "Pay for storage"}
                      </button>
                    ) : (
                      <span className="badge bg-light text-dark">Wait for arrival</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
