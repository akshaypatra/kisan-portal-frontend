import React, { useEffect, useMemo, useState } from "react";
import transportService from "../../services/transportService";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
  DirectionsRenderer,
} from "@react-google-maps/api";
import CONFIG from "../../config";
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from "../../constants/googleMaps";

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toNum(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function isValidCoord(lat, lng) {
  const nlat = toNum(lat);
  const nlng = toNum(lng);
  return nlat !== null && nlng !== null && Math.abs(nlat) <= 90 && Math.abs(nlng) <= 180 && !(nlat === 0 && nlng === 0);
}

function RequestCard({ request, vehicles, onAccept, mapLoaded }) {
  const [vehicleId, setVehicleId] = useState("");
  const [route, setRoute] = useState(null);
  const [routeRequested, setRouteRequested] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const pickup = isValidCoord(request.pickup_lat, request.pickup_lng);
  const drop = isValidCoord(request.drop_lat, request.drop_lng);
  const hasCoords = pickup && drop;
  const pickLatNum = toNum(request.pickup_lat);
  const pickLngNum = toNum(request.pickup_lng);
  const dropLatNum = toNum(request.drop_lat);
  const dropLngNum = toNum(request.drop_lng);
  const fallbackDistance =
    request.distance_km ||
    (hasCoords ? haversineKm(pickLatNum, pickLngNum, dropLatNum, dropLngNum) : null);
  const routeDistanceKm = route?.routes?.[0]?.legs?.[0]?.distance?.value
    ? route.routes[0].legs[0].distance.value / 1000
    : null;
  const distance = routeDistanceKm || fallbackDistance;
  const price = distance ? distance * 10 : null;
  const center = hasCoords
    ? { lat: (pickLatNum + dropLatNum) / 2, lng: (pickLngNum + dropLngNum) / 2 }
    : drop
    ? { lat: dropLatNum, lng: dropLngNum }
    : pickup
    ? { lat: pickLatNum, lng: pickLngNum }
    : { lat: 20.5937, lng: 78.9629 }; // India center

  const path =
    hasCoords && route?.routes?.[0]?.overview_path
      ? route.routes[0].overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() }))
      : [];

  useEffect(() => {
    setRoute(null);
    setRouteRequested(false);
  }, [pickLatNum, pickLngNum, dropLatNum, dropLngNum]);

  useEffect(() => {
    if (!mapLoaded || !hasCoords || routeRequested || route) return;
    if (!window.google?.maps?.DirectionsService) return;
    setRouteRequested(true);
    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: { lat: pickLatNum, lng: pickLngNum },
        destination: { lat: dropLatNum, lng: dropLngNum },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK") {
          setRoute(res);
        } else {
          // allow fallback polyline
          setRoute(null);
        }
      }
    );
  }, [mapLoaded, hasCoords, routeRequested, route, pickLatNum, pickLngNum, dropLatNum, dropLngNum]);

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="fw-bold">Farmer: {request.farmer_name}</div>
            {request.farmer_phone && <div className="text-muted small">Contact: {request.farmer_phone}</div>}
            <div className="text-muted small">Plot: {request.plot_name}</div>
          </div>
          <span className={`badge ${request.status === "new" ? "bg-warning text-dark" : "bg-success"}`}>
            {request.status}
          </span>
        </div>

        <div className="table-responsive mb-2">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Qty (qtls)</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(request.goods_details) && request.goods_details.length > 0 ? (
                request.goods_details.map((g, idx) => (
                  <tr key={idx}>
                    <td>{g.name}</td>
                    <td>{g.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>{request.crop_name || "-"}</td>
                  <td>{request.quantity}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-muted small mb-2">
          Ship: {request.shipping_date || "-"} @ {request.shipping_time || "-"} · Drop: {request.drop_location || "-"}
        </div>

        {hasCoords && mapLoaded && (
          <div className="rounded-3 overflow-hidden mb-2" style={{ height: 220, border: "1px solid #eef2f7" }}>
            <GoogleMap
              mapContainerStyle={{ height: "100%", width: "100%" }}
              center={center}
              zoom={8}
              options={{ disableDefaultUI: true }}
            >
              {route && (
                <DirectionsRenderer
                  directions={route}
                  options={{ suppressMarkers: true, polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5 } }}
                />
              )}
              {path[0] && <Marker position={path[0]} label="P" />}
              {path[path.length - 1] && <Marker position={path[path.length - 1]} label="D" />}
            </GoogleMap>
          </div>
        )}
        {!hasCoords && mapLoaded && (pickup || drop) && (
          <div className="rounded-3 overflow-hidden mb-2" style={{ height: 200, border: "1px solid #eef2f7" }}>
            <GoogleMap
              mapContainerStyle={{ height: "100%", width: "100%" }}
              center={center}
              zoom={12}
              options={{ disableDefaultUI: true }}
            >
              {pickup && <Marker position={{ lat: request.pickup_lat, lng: request.pickup_lng }} label="P" />}
              {drop && <Marker position={{ lat: request.drop_lat, lng: request.drop_lng }} label="D" />}
            </GoogleMap>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-muted small">
            Distance: {distance ? `${distance.toFixed(1)} km` : "N/A"} · Price: {price ? `₹${price.toFixed(0)}` : "N/A"}
          </div>
          <div className="text-muted small">Vehicle pref: {request.vehicle_type || "any"}</div>
        </div>

        {request.status === "new" && (
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} · {v.vehicle_type} · {v.capacity_tons}t
                </option>
              ))}
            </select>
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                if (!vehicleId) {
                  setAcceptError("Pick a vehicle first");
                  return;
                }
                setAcceptError("");
                onAccept(request.id, vehicleId);
              }}
            >
              Accept
            </button>
          </div>
        )}
        {acceptError && <div className="text-danger small mt-1">{acceptError}</div>}
      </div>
    </div>
  );
}

export default function TransportRequestsBoard({ vehicles }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await transportService.listBookings();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (bookingId, vehicleId) => {
    try {
      await transportService.acceptBooking(bookingId, vehicleId);
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Could not accept booking");
    }
  };

  const grouped = useMemo(
    () => ({
      new: requests.filter((r) => r.status === "new"),
      accepted: requests.filter((r) => r.status === "accepted"),
    }),
    [requests]
  );

  return (
    <div className="row g-3 mt-4">
      <div className="col-lg-6">
        <h6 className="mb-2">New requests</h6>
        <div className="vstack gap-3">
          {grouped.new.length === 0 && <div className="card card-body text-muted">No requests</div>}
          {grouped.new.map((req) => (
            <RequestCard key={req.id} request={req} vehicles={vehicles || []} onAccept={handleAccept} mapLoaded={isLoaded} />
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <h6 className="mb-2">Accepted</h6>
        <div className="vstack gap-3">
          {grouped.accepted.length === 0 && <div className="card card-body text-muted">No accepted requests</div>}
          {grouped.accepted.map((req) => (
            <RequestCard key={req.id} request={req} vehicles={vehicles || []} onAccept={() => {}} mapLoaded={isLoaded} />
          ))}
        </div>
      </div>
      {loading && <div className="text-center text-muted small mt-2">Refreshing...</div>}
    </div>
  );
}
