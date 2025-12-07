import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import driverService from "../services/driverService";
import { Scanner } from "@yudiel/react-qr-scanner";
import QRCode from "react-qr-code";
import AIAdvisoryBanner from "../Components/Common/AIAdvisoryBanner";

function QRScannerModal({ onClose, onDetected }) {
  const [hasDecoded, setHasDecoded] = useState(false);
  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Scan plot QR</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <Scanner
              onScan={(text) => {
                if (text && !hasDecoded) {
                  setHasDecoded(true);
                  onDetected(text);
                }
              }}
              onError={(error) => console.error(error?.message || error)}
              constraints={{ facingMode: "environment" }}
              components={{ finder: false }}
              styles={{ container: { width: "100%" }, video: { width: "100%" } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [scanBookingId, setScanBookingId] = useState(null);
  const [scanError, setScanError] = useState("");
  const [completingId, setCompletingId] = useState(null);
  const [showQrId, setShowQrId] = useState(null);
  const toNum = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };
  const buildNavUrl = (pickupLat, pickupLng, dropLat, dropLng) => {
    const oLat = toNum(pickupLat);
    const oLng = toNum(pickupLng);
    const dLat = toNum(dropLat);
    const dLng = toNum(dropLng);
    if (oLat === null || oLng === null || dLat === null || dLng === null) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${dLat},${dLng}&travelmode=driving`;
  };
  const navigate = useNavigate();

  const driverAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("driverAuth") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    if (!driverAuth?.contact_number || !driverAuth?.password) {
      navigate("/driver-login");
      return;
    }
    loadSchedule();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await driverService.schedule(driverAuth.contact_number, driverAuth.password);
      setSchedule(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async (bookingId) => {
    try {
      await driverService.startBooking(bookingId, driverAuth.contact_number, driverAuth.password);
      loadSchedule();
    } catch (err) {
      console.error(err);
      setError("Could not start trip.");
    }
  };

  const completeTrip = async (bookingId) => {
    setCompletingId(bookingId);
    setError("");
    const getPosition = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation not available"));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
    try {
      const pos = await getPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      await driverService.completeTrip(bookingId, driverAuth.contact_number, driverAuth.password, lat, lng);
      loadSchedule();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.message || "Could not complete trip.";
      setError(msg);
    } finally {
      setCompletingId(null);
    }
  };

  const extractScannerText = (result) => {
    if (!result) return "";
    if (typeof result === "string") return result;
    if (Array.isArray(result) && result.length) return result[0].rawValue || "";
    if (result?.rawValue) return result.rawValue;
    return "";
  };

  const handleScanDetected = async (raw) => {
    const text = extractScannerText(raw);
    console.log("Driver scan raw:", raw, "parsed:", text);
    if (!text) {
      setScanError("Could not read QR.");
      return;
    }
    const activeBooking = schedule.find((b) => b.id === scanBookingId);
    if (!activeBooking) {
      setScanError("No booking selected.");
      return;
    }
    const plotId = String(activeBooking.plot_id || "").trim();
    let scanned = String(text || "").trim();
    try {
      const parsed = JSON.parse(scanned);
      if (parsed.plot_id || parsed.id) {
        scanned = String(parsed.plot_id || parsed.id).trim();
      }
    } catch {
      // leave scanned as-is
    }
    console.log("Compare scanned plot id ->", scanned, "expected ->", plotId);
    if (scanned !== plotId) {
      setScanError("QR does not match this plot.");
      return;
    }
    setScanError("");
    setScanBookingId(null);
    await startTrip(activeBooking.id);
  };

  return (
    <div className="container py-4">
      <AIAdvisoryBanner />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Driver Dashboard</h4>
          <div className="text-muted small">{driverAuth.driver_name} · {driverAuth.vehicle_number}</div>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={loadSchedule} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {error && <div className="alert alert-warning py-2">{error}</div>}

      <div className="row g-3">
        {schedule.map((item) => (
          <div key={item.id} className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">Farmer: {item.farmer_name}</div>
                    <div className="text-muted small">Plot: {item.plot_name}</div>
                  </div>
                  <span className={`badge ${item.status === "in_transit" ? "bg-success" : "bg-warning text-dark"}`}>
                    {item.status}
                  </span>
                </div>
            <div className="text-muted small mb-1">
              Drop: {item.drop_location || "-"}
            </div>
            <div className="text-muted small mb-2">
              Ship: {item.shipping_date || "-"} @ {item.shipping_time || "-"}
            </div>
            <div className="text-muted small mb-2">
              {buildNavUrl(item.pickup_lat, item.pickup_lng, item.drop_lat, item.drop_lng) ? (
                <a
                  href={buildNavUrl(item.pickup_lat, item.pickup_lng, item.drop_lat, item.drop_lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  Open navigation
                </a>
              ) : (
                "Navigation not available"
              )}
            </div>
                <div className="text-muted small mb-2">
                  Crops: {Array.isArray(item.goods_details) && item.goods_details.length
                    ? item.goods_details.map((g) => `${g.name} (${g.quantity})`).join(", ")
                    : `${item.crop_name || "-"} (${item.quantity || 0})`}
                </div>

                {item.status !== "in_transit" && (
                  <div className="vstack gap-2">
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter plot QR / ID"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                      />
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => startTrip(item.id)}>
                        Start
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setScanBookingId(item.id);
                          setScanError("");
                        }}
                      >
                        Scan QR
                      </button>
                    </div>
                    {scanError && scanBookingId === item.id && <div className="text-danger small">{scanError}</div>}
                  </div>
                )}
                {item.status === "in_transit" && (
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-success"
                      disabled={completingId === item.id}
                      onClick={() => completeTrip(item.id)}
                    >
                      {completingId === item.id ? "Completing..." : "Complete Trip (within 500m)"}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-dark ms-2"
                      onClick={() => setShowQrId(showQrId === item.id ? null : item.id)}
                    >
                      {showQrId === item.id ? "Hide QR" : "Show QR for storage scan"}
                    </button>
                  </div>
                )}
                {showQrId === item.id && (
                  <div className="mt-2 p-2 border rounded-3 bg-light">
                    <div className="small text-muted mb-1">Scan at storage to mark offloaded</div>
                    <QRCode value={JSON.stringify({ booking_id: item.id, vehicle_number: item.vehicle_number })} size={140} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {scanBookingId && (
        <QRScannerModal
          onClose={() => setScanBookingId(null)}
          onDetected={handleScanDetected}
        />
      )}
    </div>
  );
}
