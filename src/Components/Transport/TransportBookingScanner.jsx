import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import transportService from "../../services/transportService";

function parseBookingId(text) {
  if (!text) return null;
  if (typeof text === "number") return text;
  if (typeof text === "string" && /^\d+$/.test(text.trim())) return Number(text.trim());
  try {
    const parsed = JSON.parse(text);
    if (parsed?.booking_id) return Number(parsed.booking_id);
    if (parsed?.id) return Number(parsed.id);
  } catch {
    /* ignore */
  }
  return null;
}

export default function TransportBookingScanner() {
  const [scanning, setScanning] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupBooking = async (bookingId) => {
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const { data } = await transportService.listBookings();
      const match = Array.isArray(data) ? data.find((b) => b.id === bookingId) : null;
      if (!match) {
        setError(`Booking #${bookingId} not found`);
        return;
      }
      setBooking(match);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scanning) return;
    setError("");
  }, [scanning]);

  const handleScan = (text) => {
    if (!text) return;
    setScanning(false);
    const id = parseBookingId(typeof text === "string" ? text : text?.text || text?.rawValue);
    if (!id) {
      setError("QR does not contain a booking id");
      return;
    }
    lookupBooking(id);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Trip QR scan</h5>
            <small className="text-muted">Scan driver QR to fetch booking</small>
          </div>
          <button className="btn btn-sm btn-outline-success" onClick={() => setScanning((s) => !s)}>
            {scanning ? "Stop scan" : "Scan QR"}
          </button>
        </div>

        {scanning && (
          <div className="mb-3">
            <Scanner
              onScan={handleScan}
              onError={(err) => setError(err?.message || "Scan error")}
              styles={{ container: { width: "100%" }, video: { width: "100%" } }}
            />
            <div className="small text-muted mt-1">Point at driver QR (booking id encoded).</div>
          </div>
        )}

        {error && <div className="alert alert-warning py-2">{error}</div>}
        {loading && <div className="alert alert-info py-2">Looking up booking...</div>}

        {booking && (
          <div className="border rounded-3 p-3" style={{ background: "#f8fafc" }}>
            <div className="fw-semibold">Booking #{booking.id}</div>
            <div className="text-muted small">
              Plot: {booking.plot_name || "-"} | Crop: {booking.crop_name || "-"}
            </div>
            <div className="text-muted small">Status: {booking.status}</div>
            <div className="text-muted small">
              Pickup: ({booking.pickup_lat}, {booking.pickup_lng}) → Drop: {booking.drop_location || "-"}
            </div>
            <div className="text-muted small">
              Goods:{" "}
              {Array.isArray(booking.goods_details) && booking.goods_details.length
                ? booking.goods_details.map((g) => `${g.name} (${g.quantity})`).join(", ")
                : `${booking.crop_name || "-"} (${booking.quantity || 0})`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
