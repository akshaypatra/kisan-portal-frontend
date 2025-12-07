import React, { useEffect, useMemo, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Scanner } from "@yudiel/react-qr-scanner";
import CONFIG from "../../config";
import storageService from "../../services/storageService";
import { useStorage } from "./StorageContext";

const BUCKETS = [
  { label: "0-6h", max: 6 },
  { label: "6-12h", max: 12 },
  { label: "12-18h", max: 18 },
  { label: "18-24h", max: 24 },
];

function bucketColor(count, slots) {
  if (!slots || slots === 0) return "bg-secondary";
  const pct = (count / slots) * 100;
  if (pct > 100) return "bg-danger text-white";
  if (pct >= 60) return "bg-warning text-dark";
  if (pct >= 50) return "bg-success text-white";
  return "bg-secondary text-white";
}

export default function StorageIncomingBoard() {
  const { facilities } = useStorage();
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const computedEtaIds = useRef(new Set());
  const [scanModal, setScanModal] = useState(false);
  const [scanBookingId, setScanBookingId] = useState(null);
  const [scanMsg, setScanMsg] = useState("");
  const [scanErr, setScanErr] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanInfo, setScanInfo] = useState("");
  const { isLoaded } = useJsApiLoader({
    id: "storage-google-map-script",
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    loadIncoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIncoming = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await storageService.incomingLoads();
      setIncoming(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Unable to load incoming loads");
    } finally {
      setLoading(false);
    }
  };

  // Compute ETA using DistanceMatrix if available, else fallback to shipping time.
  useEffect(() => {
    if (!isLoaded || !window.google?.maps) return;
    const service = new window.google.maps.DistanceMatrixService();
    const toCompute = incoming.filter(
      (item) =>
        item &&
        !item.eta_arrival_ts &&
        item.pickup_lat &&
        item.pickup_lng &&
        item.storage_facility?.latitude &&
        item.storage_facility?.longitude &&
        !computedEtaIds.current.has(item.id)
    );
    if (!toCompute.length) return;

    let cancelled = false;
    toCompute.forEach((item) => {
      computedEtaIds.current.add(item.id);
      const origin = { lat: item.pickup_lat, lng: item.pickup_lng };
      const dest = {
        lat: item.storage_facility.latitude,
        lng: item.storage_facility.longitude,
      };
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [dest],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (cancelled) return;
          if (status !== "OK") return;
          const el = res.rows?.[0]?.elements?.[0];
          if (!el || el.status !== "OK") return;
          const durationSec = el.duration?.value;
          if (!durationSec) return;
          setIncoming((prev) =>
            prev.map((b) =>
              b.id === item.id
                ? {
                    ...b,
                    eta_seconds: durationSec,
                    eta_arrival_ts: Date.now() + durationSec * 1000,
                  }
                : b
            )
          );
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, incoming]);

  const facilitiesMap = useMemo(() => {
    const map = {};
    facilities.forEach((f) => (map[f.id] = f));
    return map;
  }, [facilities]);

  const grouped = useMemo(() => {
    const now = Date.now();
    const byFacility = {};
    const fmtLocalDate = (ts) => {
      const d = new Date(ts);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    // seed all facilities so we always render rows
    Object.values(facilitiesMap).forEach((facility) => {
      if (!facility?.id) return;
      byFacility[facility.id] = {
        facility,
        buckets: [0, 0, 0, 0],
        bookings: [],
      };
    });
    incoming.forEach((b) => {
      const fid = b.storage_facility?.id;
      if (!fid) return;
      const facility = facilitiesMap[fid] || b.storage_facility;
      const arrivalTs =
        b.eta_arrival_ts ||
        (b.shipping_date
          ? new Date(`${b.shipping_date}T${b.shipping_time || "00:00"}`).getTime()
          : null);
      const deltaHours = arrivalTs ? (arrivalTs - now) / (1000 * 60 * 60) : null;
      // date filter: match shipping date or arrivalTs date
      if (selectedDate) {
        const arrivalDateStr = arrivalTs ? fmtLocalDate(arrivalTs) : null;
        const shipDateStr = b.shipping_date ? String(b.shipping_date).slice(0, 10) : null;
        if (arrivalDateStr !== selectedDate && shipDateStr !== selectedDate) {
          return;
        }
      }
      const bucketIndex =
        deltaHours === null
          ? null
          : deltaHours <= 6
          ? 0
          : deltaHours <= 12
          ? 1
          : deltaHours <= 18
          ? 2
          : deltaHours <= 24
          ? 3
          : null;
      if (!byFacility[fid]) {
        byFacility[fid] = {
          facility,
          buckets: [0, 0, 0, 0],
          bookings: [],
        };
      }
      if (bucketIndex !== null) {
        byFacility[fid].buckets[bucketIndex] += 1;
      }
      byFacility[fid].bookings.push({ ...b, deltaHours, arrivalTs });
    });
    // sort by soonest arrival
    Object.values(byFacility).forEach((g) =>
      g.bookings.sort((a, b) => (a.arrivalTs || Infinity) - (b.arrivalTs || Infinity))
    );
    return Object.values(byFacility);
  }, [incoming, facilitiesMap, selectedDate]);

  const openScan = (bookingId) => {
    setScanBookingId(bookingId);
    setScanMsg("");
    setScanErr("");
    setScanModal(true);
  };

  const handleScan = async (text) => {
    if (!text) return;
    console.log("QR scan payload (raw):", text);
    // normalise payload when scanner returns array/object
    const primary =
      Array.isArray(text) && text.length ? text[0] : text?.text || text?.rawValue || text;
    let scannedBooking = scanBookingId;
    let scannedVehicle = null;
    try {
      setScanLoading(true);
      setScanErr("");
      setScanMsg("");
      const raw = typeof primary === "string" ? primary : JSON.stringify(primary);
      console.log("QR raw string:", raw);
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.booking_id) scannedBooking = parsed.booking_id;
        if (parsed?.vehicle_number) scannedVehicle = parsed.vehicle_number;
      } catch {
        // ignore parse error; rely on raw
      }
      setScanInfo(`QR parsed -> booking_id: ${scannedBooking || "none"}, vehicle: ${scannedVehicle || "none"}, raw: ${raw}`);
      if (!scannedBooking) {
        setScanErr("QR did not include a booking id.");
        setScanMsg("");
        setScanLoading(false);
        return;
      }
      const payload = {
        booking_id: Number(scannedBooking),
        vehicle_number: scannedVehicle || null,
        qr_data: raw,
      };
      console.log("Sending intake lookup payload:", payload);
      const { data } = await storageService.intakeLookup(payload);
      console.log("QR lookup success:", data);
      setScanMsg(`Booking #${scannedBooking} verified via QR.`);
      setScanErr("");
    } catch (err) {
      console.error("QR lookup failed", err);
      const msg = err?.response?.data?.detail || "QR lookup failed.";
      setScanErr(typeof msg === "object" ? JSON.stringify(msg) : msg);
      setScanMsg("");
    } finally {
      setScanLoading(false);
      setScanModal(false);
    }
  };

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Incoming loads & stress</h5>
            <small className="text-muted">ETA via Google Distance Matrix</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedDate("")}>
                Clear
              </button>
            )}
            <button className="btn btn-sm btn-outline-secondary" onClick={loadIncoming} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        {error && <div className="alert alert-warning py-2">{error}</div>}
        {scanMsg && <div className="alert alert-success py-2">{scanMsg}</div>}
        {scanErr && <div className="alert alert-warning py-2">{scanErr}</div>}
        {scanInfo && <div className="alert alert-info py-2">{scanInfo}</div>}
        {!error && !incoming.length && !loading && (
          <div className="alert alert-light py-2 border">
            No incoming loads detected yet. Once transporters accept bookings to your facilities, ETA buckets will appear here.
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {grouped.map(({ facility, buckets, bookings }) => (
            <div key={facility.id} className="border rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="fw-semibold">{facility.name}</div>
                  <div className="text-muted small">
                    {facility.city}, {facility.state} · Slots: {facility.offloading_slots}
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 mb-3">
                {BUCKETS.map((b, idx) => (
                  <div
                    key={b.label}
                    className={`px-2 py-1 rounded ${bucketColor(buckets[idx], facility.offloading_slots)}`}
                    style={{ minWidth: 80 }}
                  >
                    <div className="small fw-bold mb-0">{b.label}</div>
                    <div className="small mb-0">{buckets[idx]} load(s)</div>
                  </div>
                ))}
              </div>
              <div className="table-responsive">
                <table className="table table-sm mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Goods</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>ETA</th>
                      <th>Intake</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td className="small">
                          {Array.isArray(b.goods_details) && b.goods_details.length
                            ? b.goods_details.map((g) => `${g.name} (${g.quantity})`).join(", ")
                            : `${b.crop_name || "-"} (${b.quantity || 0})`}
                        </td>
                        <td className="small">{b.vehicle_number || "Pending"}</td>
                        <td>
                          <span className="badge bg-light text-dark">{b.status}</span>
                        </td>
                        <td className="small">
                          {b.arrivalTs
                            ? `${new Date(b.arrivalTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${Math.max(
                                0,
                                b.deltaHours || 0
                              ).toFixed(1)}h)`
                            : b.shipping_time || "Unknown"}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-success" onClick={() => openScan(b.id)}>
                            Scan QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
      {scanModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Scan driver QR for booking #{scanBookingId}</h6>
                <button type="button" className="btn-close" onClick={() => setScanModal(false)}></button>
              </div>
              <div className="modal-body">
                {scanLoading && <div className="alert alert-info py-2">Looking up booking...</div>}
                <Scanner
                  onScan={handleScan}
                  onError={(err) => setScanErr(err?.message || "Scan error")}
                  styles={{ container: { width: "100%" }, video: { width: "100%" } }}
                />
                <div className="small text-muted mt-2">
                  Use the driver's QR (contains booking info) to auto-verify intake without typing vehicle numbers.
                </div>
                {scanInfo && <div className="alert alert-secondary mt-2 py-2">{scanInfo}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
