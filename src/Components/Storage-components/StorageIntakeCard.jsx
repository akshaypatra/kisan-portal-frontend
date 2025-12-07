import React, { useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import storageService from "../../services/storageService";
import { useStorage } from "./StorageContext";

export default function StorageIntakeCard() {
  const { facilities, applyIntakeUpdate, fetchFacilities } = useStorage();
  const [booking, setBooking] = useState(null);
  const [inputBookingId, setInputBookingId] = useState("");
  const [block, setBlock] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [goodsAdjustments, setGoodsAdjustments] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanInfo, setScanInfo] = useState("");

  const facilityOptions = useMemo(
    () => facilities.map((f) => ({ value: f.id, label: `${f.name} (${f.city || ""})` })),
    [facilities]
  );

  const handleScan = (result) => {
    if (!result) return;
    setScanning(false);
    setError("");

    console.log("QR Scanner Result:", result); // Debug log

    // Extract text from scanner result - handle different formats
    let raw = "";
    if (typeof result === "string") {
      raw = result;
    } else if (Array.isArray(result) && result.length > 0) {
      raw = result[0]?.rawValue || result[0]?.text || result[0];
    } else if (result?.rawValue) {
      raw = result.rawValue;
    } else if (result?.text) {
      raw = result.text;
    } else {
      raw = JSON.stringify(result);
    }

    console.log("Extracted Raw Text:", raw); // Debug log

    let bookingId = null;
    let vehicleNumber = null;

    // Try parsing as JSON
    try {
      const parsed = JSON.parse(raw);
      console.log("Parsed JSON:", parsed); // Debug log
      bookingId = parsed.booking_id || parsed.bookingId || parsed.id;
      vehicleNumber = parsed.vehicle_number || parsed.vehicleNumber;
    } catch (e) {
      console.log("Not JSON, treating as plain booking ID"); // Debug log
      // Not JSON, treat as plain booking ID
      bookingId = raw.trim();
    }

    console.log("Extracted Booking ID:", bookingId); // Debug log

    if (bookingId) {
      setInputBookingId(bookingId);
      setScanInfo(`Scanned booking #${bookingId}${vehicleNumber ? ` (${vehicleNumber})` : ""}`);
      lookupBooking(bookingId);
    } else {
      setError(`QR scanned but no booking ID found. Raw: ${raw.substring(0, 100)}`);
    }
  };

  const formatErr = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) {
      const msgs = val.map((x) => x?.msg || x?.message || JSON.stringify(x)).filter(Boolean);
      return msgs.join(", ") || "Unexpected error";
    }
    if (typeof val === "object") {
      return val.msg || val.message || JSON.stringify(val);
    }
    return String(val);
  };

  const lookupBooking = async (bookingIdOverride = null) => {
    const bookingId = bookingIdOverride || inputBookingId;

    if (!bookingId) {
      setError("Enter booking ID or scan driver QR code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setScanInfo("");

    try {
      const { data } = await storageService.intakeLookup({ booking_id: Number(bookingId) });

      setBooking(data);
      setSuccess("Booking found! Review details and assign storage location.");

      // Pre-fill facility if already set in booking
      if (data.storage_facility_id) {
        setFacilityId(data.storage_facility_id);
      }

      // Build goods list for quantity adjustment
      const goods = Array.isArray(data.goods_details) && data.goods_details.length > 0
        ? data.goods_details.map((g) => ({
            name: g.name || data.crop_name || "Crop",
            plannedQty: Number(g.quantity) || 0,
            receivedQty: Number(g.quantity) || 0,
          }))
        : [{
            name: data.crop_name || "Crop",
            plannedQty: Number(data.quantity) || 0,
            receivedQty: Number(data.quantity) || 0,
          }];

      setGoodsAdjustments(goods);
    } catch (err) {
      console.error(err);
      const msg = formatErr(err?.response?.data?.detail) || "Booking not found";
      setError(msg);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const markStored = async () => {
    if (!booking?.id) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const totalReceived =
        goodsAdjustments && goodsAdjustments.length
          ? goodsAdjustments.reduce(
              (sum, g) => sum + (Number.isFinite(Number(g.receivedQty)) ? Number(g.receivedQty) : Number(g.plannedQty) || 0),
              0
            )
          : 0;

      console.log("=== STORAGE INTAKE DEBUG ===");
      console.log("Booking ID:", booking.id);
      console.log("Facility ID:", facilityId);
      console.log("Storage Block:", block);
      console.log("Total Received Qty:", totalReceived);

      const payload = {
        booking_id: booking.id,
        storage_facility_id: facilityId ? Number(facilityId) : null,
        storage_block: block || null,
        intake_qty: totalReceived,
      };

      console.log("Sending payload to backend:", payload);

      const { data } = await storageService.intakeReceive(payload);

      console.log("Response from backend:", data);
      console.log("Booking intake_status:", data.intake_status);
      console.log("Booking status:", data.status);
      console.log("Storage facility ID:", data.storage_facility_id);

      setSuccess("Stored and receipt generated.");
      applyIntakeUpdate?.(data);

      // Refresh facilities to get updated capacity from backend
      console.log("Fetching updated facilities from backend...");
      await fetchFacilities();

      // Reset form for next intake
      setBooking(null);
      setBlock("");
      setInputBookingId("");
      setScanInfo("");
      setGoodsAdjustments([]);
      setFacilityId("");
    } catch (err) {
      console.error("ERROR saving intake:", err);
      console.error("Error response:", err?.response?.data);
      const msg = formatErr(err?.response?.data?.detail) || "Could not mark stored.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Storage intake</h5>
            <small className="text-muted">Scan driver QR to mark lot stored</small>
          </div>
          <button className="btn btn-sm btn-outline-success" onClick={() => setScanning((s) => !s)}>
            {scanning ? "Stop scan" : "Scan QR"}
          </button>
        </div>

        {scanning && (
          <div className="mb-3">
            <Scanner
              onScan={handleScan}
              onError={(err) => console.error(err)}
              styles={{ container: { width: "100%" }, video: { width: "100%" } }}
            />
            <small className="text-muted">Point at driver QR (contains booking id)</small>
          </div>
        )}

        {error && <div className="alert alert-warning py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
        {scanInfo && <div className="alert alert-info py-2">{scanInfo}</div>}

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small text-muted">Booking ID</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={inputBookingId}
              onChange={(e) => setInputBookingId(e.target.value)}
              placeholder="From QR or manual"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button className="btn btn-success w-100" onClick={() => lookupBooking()} disabled={loading}>
              {loading ? "Looking..." : "Lookup"}
            </button>
          </div>
        </div>

        {booking && (
          <>
            <div className="border rounded-3 p-3 mb-3" style={{ background: "#f8fafc" }}>
              <div className="fw-semibold">Booking #{booking.id}</div>
              <div className="text-muted small">
                Farmer: {booking.farmer_name} | Drop: {booking.drop_location || "NA"}
              </div>
              <div className="text-muted small">Goods (from booking):</div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-2">
                  <thead className="table-light">
                    <tr>
                      <th>Crop</th>
                      <th>Planned qty</th>
                      <th>Received qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsAdjustments.map((g, idx) => (
                      <tr key={`${g.name}-${idx}`}>
                        <td className="small">{g.name}</td>
                        <td className="small">{g.plannedQty}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={g.receivedQty}
                            min="0"
                            step="0.1"
                            onChange={(e) => {
                              const val = e.target.value;
                              setGoodsAdjustments((prev) =>
                                prev.map((row, rIdx) =>
                                  rIdx === idx ? { ...row, receivedQty: Number(val) } : row
                                )
                              );
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="small fw-semibold">
                Total to store:{" "}
                {goodsAdjustments.reduce(
                  (sum, g) => sum + (Number.isFinite(Number(g.receivedQty)) ? Number(g.receivedQty) : Number(g.plannedQty) || 0),
                  0
                )}
              </div>
              <div className="text-muted small">
                Intake: {booking.intake_status || "pending"} | Payment: {booking.payment_status || "pending"}
              </div>
            </div>

            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <label className="form-label small text-muted">Facility</label>
                <select
                  className="form-select form-select-sm"
                  value={facilityId || ""}
                  onChange={(e) => setFacilityId(e.target.value)}
                >
                  <option value="">Select facility</option>
                  {facilityOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted">Block / bin</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="Block A / Bin 3"
                />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" onClick={markStored} disabled={loading}>
                {loading ? "Saving..." : "Mark stored"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
