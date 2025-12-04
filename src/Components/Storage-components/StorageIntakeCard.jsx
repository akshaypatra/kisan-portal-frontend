import React, { useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import storageService from "../../services/storageService";
import { useStorage } from "./StorageContext";

export default function StorageIntakeCard() {
  const { facilities } = useStorage();
  const [booking, setBooking] = useState(null);
  const [inputBookingId, setInputBookingId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [block, setBlock] = useState("");
  const [qty, setQty] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const facilityOptions = useMemo(
    () => facilities.map((f) => ({ value: f.id, label: `${f.name} (${f.city || ""})` })),
    [facilities]
  );

  const handleScan = (text) => {
    if (!text) return;
    setScanning(false);
    setQrPayload(text);
    try {
      const parsed = JSON.parse(typeof text === "string" ? text : text.rawValue || "{}");
      if (parsed.booking_id) setInputBookingId(parsed.booking_id);
      if (parsed.vehicle_number) setVehicleNumber(parsed.vehicle_number);
    } catch {
      // ignore parse issues
    }
  };

  const lookup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        booking_id: inputBookingId ? Number(inputBookingId) : null,
        vehicle_number: vehicleNumber || null,
        qr_data: qrPayload || null,
      };
      const { data } = await storageService.intakeLookup(payload);
      setBooking(data);
      setSuccess("Booking found. Assign block and mark stored.");
      if (data.storage_facility_id) setFacilityId(data.storage_facility_id);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || "Could not find booking from scan.";
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
      const payload = {
        booking_id: booking.id,
        storage_facility_id: facilityId ? Number(facilityId) : null,
        storage_block: block || null,
        intake_qty: qty ? Number(qty) : null,
      };
      const { data } = await storageService.intakeReceive(payload);
      setBooking(data);
      setSuccess("Stored and receipt generated.");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || "Could not mark stored.";
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

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small text-muted">Booking ID</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={inputBookingId}
              onChange={(e) => setInputBookingId(e.target.value)}
              placeholder="From QR or manual"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Vehicle number (optional)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="MH12AB1234"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button className="btn btn-success w-100" onClick={lookup} disabled={loading}>
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
              <div className="text-muted small">
                Goods:{" "}
                {Array.isArray(booking.goods_details) && booking.goods_details.length
                  ? booking.goods_details.map((g) => `${g.name} (${g.quantity})`).join(", ")
                  : `${booking.crop_name || "-"} (${booking.quantity || 0})`}
              </div>
              <div className="text-muted small">
                Intake: {booking.intake_status || "pending"} | Payment: {booking.payment_status || "pending"}
              </div>
            </div>

            <div className="row g-2 align-items-end">
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label className="form-label small text-muted">Block / bin</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="Block A / Bin 3"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted">Quantity received (qtls)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="Enter qty"
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
