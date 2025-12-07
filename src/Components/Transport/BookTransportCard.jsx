import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import transportService from "../../services/transportService";
import CONFIG from "../../config";
import storageService from "../../services/storageService";
import { FaTruckMoving, FaMapMarkedAlt, FaInfoCircle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = { lat: 18.5616, lng: 73.7769 }; // Balewadi depot
const PLOTS_ENDPOINT = "/api/plots/with-cycles";
const GOOGLE_LIBRARIES = ["places"];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const mapPlot = (plot) => {
  const cropCycles = Array.isArray(plot.crop_cycles) ? plot.crop_cycles : [];
  const polygonCoords =
    plot.polygon_coordinates && Array.isArray(plot.polygon_coordinates.coordinates)
      ? plot.polygon_coordinates.coordinates[0] || []
      : [];
  const mapPolygon = polygonCoords.map(([lng, lat]) => [lat, lng]);
  const markerPoint =
    Array.isArray(plot.markers) && plot.markers.length
      ? { lat: plot.markers[0].lat, lng: plot.markers[0].lng }
      : null;
  const centroid =
    mapPolygon.length > 0
      ? {
          lat: mapPolygon.reduce((sum, p) => sum + p[0], 0) / mapPolygon.length,
          lng: mapPolygon.reduce((sum, p) => sum + p[1], 0) / mapPolygon.length,
        }
      : null;
  const mapCenter = markerPoint || centroid;
  return {
    id: plot.id,
    name: plot.plot_name,
    crops: cropCycles.map((c) => ({
      id: c.id,
      name: c.crop_name,
      harvested_qty_total: c.harvested_qty_total || 0,
    })),
    map_center: mapCenter,
  };
};

export default function BookTransportCard({ farmerId }) {
  const [plots, setPlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [waiting, setWaiting] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(300);
  const [bookingId, setBookingId] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [storages, setStorages] = useState([]);
  const [storageSearch, setStorageSearch] = useState("");

  const [form, setForm] = useState({
    plot_id: "",
    crops: [],
    is_shared: true,
    vehicle_type: "any",
    drop_location: "",
    drop_lat: null,
    drop_lng: null,
    storage_facility_id: null,
    shipping_date: "",
    shipping_time: "",
  });
  const { isLoaded } = useJsApiLoader({
    id: "transport-book-map",
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_LIBRARIES,
  });
  const [dropAutocomplete, setDropAutocomplete] = useState(null);

  useEffect(() => {
    loadPlots();
    loadVehicles();
    loadStorages();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const loadPlots = async () => {
    if (!farmerId) return;
    try {
      const { data } = await api.get(`${PLOTS_ENDPOINT}/${farmerId}`);
      const mapped = Array.isArray(data) ? data.map(mapPlot) : [];
      setPlots(mapped);
    } catch (err) {
      console.error(err);
      setError("Could not load plots/crops");
    }
  };

  const loadStorages = async () => {
    try {
      const { data } = await storageService.listFacilities();
      setStorages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data } = await transportService.listVehicles("all");
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedPlot = useMemo(() => plots.find((p) => p.id === Number(form.plot_id)), [plots, form.plot_id]);
  const filteredVehicles = useMemo(() => {
    if (!vehicles.length) return [];
    return vehicles
      .map((v) => {
        if (v.latitude === null || v.longitude === null) return null;
        const dist = haversineKm(userLocation.lat, userLocation.lng, v.latitude, v.longitude);
        return { ...v, distance: dist };
      })
      .filter((v) => v && v.distance <= 100);
  }, [vehicles, userLocation]);
  const availableCrops = useMemo(() => selectedPlot?.crops || [], [selectedPlot]);
  const mapCenter = selectedPlot?.map_center || userLocation;

  const filteredStorages = useMemo(() => {
    if (!storages.length) return [];
    const query = storageSearch.trim().toLowerCase();
    const list = storages
      .map((s) => {
        const dist =
          mapCenter && s.latitude !== null && s.longitude !== null
            ? haversineKm(mapCenter.lat, mapCenter.lng, s.latitude, s.longitude)
            : null;
        return { ...s, distance: dist };
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

    if (!query) return list.slice(0, 5);
    return list
      .filter((s) => {
        const hay = `${s.name} ${s.city} ${s.state}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 5);
  }, [storages, storageSearch, mapCenter]);

  useEffect(() => {
    if (!waiting || !bookingId) return;
    const poll = async () => {
      try {
        const { data } = await transportService.listBookings();
        const match = Array.isArray(data) ? data.find((b) => b.id === bookingId) : null;
        if (match && match.status === "accepted") {
          setAccepted(true);
          setWaiting(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    poll();
    const pollInterval = setInterval(poll, 5000);
    const timerInterval = setInterval(() => setWaitSeconds((prev) => Math.max(0, prev - 1)), 1000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [waiting, bookingId]);

  useEffect(() => {
    if (waitSeconds === 0) {
      setWaiting(false);
    }
  }, [waitSeconds]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "drop_location" ? { storage_facility_id: null } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const chosenCrops = (form.crops || []).filter((c) => c.quantity > 0);
    if (!form.plot_id || !form.drop_location || !form.shipping_date || !form.shipping_time || !chosenCrops.length) {
      setError("Select plot, drop, schedule, and at least one crop with quantity.");
      setLoading(false);
      return;
    }
    try {
      const plotName = selectedPlot?.name || "";
      const res = await transportService.createBooking({
        plot_id: Number(form.plot_id),
        plot_name: plotName,
        crops: chosenCrops,
        is_shared: Boolean(form.is_shared),
        vehicle_type: form.vehicle_type,
        drop_location: form.drop_location,
        drop_lat: form.drop_lat,
        drop_lng: form.drop_lng,
        storage_facility_id: form.storage_facility_id,
        pickup_lat: selectedPlot?.map_center?.lat || userLocation.lat,
        pickup_lng: selectedPlot?.map_center?.lng || userLocation.lng,
        shipping_date: form.shipping_date,
        shipping_time: form.shipping_time,
      });
      if (res?.data?.id) setBookingId(res.data.id);
      setSuccess("Request sent. Waiting for transporter to accept...");
      setWaiting(true);
      setWaitSeconds(300);
      setAccepted(false);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Failed to create booking.";
      setError(msg);
    }
    setLoading(false);
  };

  const nearbySummary =
    filteredVehicles.length === 0
      ? "No live vehicles in 100 km now."
      : filteredVehicles
          .slice(0, 3)
          .map((v) => `${v.vehicle_number} (${v.distance.toFixed(1)} km)`)
          .join(", ");

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaTruckMoving className="text-success" />
          <h5 className="mb-0">Book transport</h5>
        </div>
        <p className="text-muted small mb-3">
          One simple form: pick your harvest, pickup time, and drop point. We ping nearby transporters right away.
        </p>
        <div className="alert alert-info py-2 d-flex align-items-start gap-2">
          <FaInfoCircle className="mt-1" />
          <div className="small mb-0">
            Shared booking saves cost by pooling loads. Separate booking reserves a dedicated vehicle and shows live trucks near you.
          </div>
        </div>

        {error && <div className="alert alert-warning py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
        {waiting && !accepted && (
          <div className="alert alert-secondary py-2">
            Waiting for transporter to accept... {Math.floor(waitSeconds / 60)}m {waitSeconds % 60}s remaining.
          </div>
        )}
        {accepted && <div className="alert alert-success py-2">A transporter accepted your request!</div>}
        {!waiting && !accepted && bookingId && waitSeconds === 0 && (
          <div className="alert alert-info py-2">
            Request sent. Keep this page open or contact trusted transporters. Nearby live vehicles: {nearbySummary || "none currently"}.
          </div>
        )}

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label small text-muted">Booking type</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn ${form.is_shared ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setForm((p) => ({ ...p, is_shared: true }))}
              >
                Shared (cheaper)
              </button>
              <button
                type="button"
                className={`btn ${!form.is_shared ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setForm((p) => ({ ...p, is_shared: false }))}
              >
                Separate vehicle
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Pickup: select plot</label>
            <select className="form-select" name="plot_id" value={form.plot_id} onChange={handleChange}>
              <option value="">Select plot</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Drop location (type address)</label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(auto) => setDropAutocomplete(auto)}
                onPlaceChanged={() => {
                  if (!dropAutocomplete) return;
                  const place = dropAutocomplete.getPlace();
                  const location = place.geometry?.location;
                  setForm((prev) => ({
                    ...prev,
                    drop_location: place.formatted_address || place.name || prev.drop_location,
                    drop_lat: location ? location.lat() : prev.drop_lat,
                    drop_lng: location ? location.lng() : prev.drop_lng,
                  }));
                }}
                options={{ componentRestrictions: { country: "in" }, fields: ["formatted_address", "name", "geometry"] }}
              >
                <input
                  type="text"
                  className="form-control"
                  name="drop_location"
                  value={form.drop_location}
                  onChange={handleChange}
                  placeholder="Search mill / warehouse address"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                className="form-control"
                name="drop_location"
                value={form.drop_location}
                onChange={handleChange}
                placeholder="Mill / warehouse address"
              />
            )}
            {form.drop_lat && form.drop_lng && (
              <small className="text-muted d-block">
                Saved: {form.drop_lat.toFixed ? form.drop_lat.toFixed(5) : form.drop_lat},{" "}
                {form.drop_lng.toFixed ? form.drop_lng.toFixed(5) : form.drop_lng}
              </small>
            )}
            <div className="mt-2">
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted">Or select a storage to deliver</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Search name / district"
                  value={storageSearch}
                  onChange={(e) => setStorageSearch(e.target.value)}
                />
              </div>
              <div className="mt-2 d-flex flex-column gap-2">
                {filteredStorages.length === 0 && (
                  <div className="text-muted small">No storages found. Try another name or district.</div>
                )}
                {filteredStorages.map((s) => (
                  <div
                    key={s.id}
                    className="border rounded-3 p-2 d-flex justify-content-between align-items-center"
                    style={{ background: "#f8fafc" }}
                  >
                    <div>
                      <div className="fw-semibold">{s.name}</div>
                      <div className="text-muted small">
                        {s.city}, {s.state} · {s.storage_type === "cold" ? "Cold" : "Warehouse"}
                        {s.distance ? ` · ${s.distance.toFixed(1)} km` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          drop_location: `${s.name}, ${s.city}, ${s.state}`,
                          drop_lat: s.latitude,
                          drop_lng: s.longitude,
                          storage_facility_id: s.id,
                        }))
                      }
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Preferred vehicle type</label>
            <select
              className="form-select"
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="tempo">Tempo</option>
              <option value="truck">Truck</option>
              <option value="tractor">Tractor</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Ship date</label>
            <input type="date" className="form-control" name="shipping_date" value={form.shipping_date} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Preferred time</label>
            <input type="time" className="form-control" name="shipping_time" value={form.shipping_time} onChange={handleChange} />
          </div>

          <div className="col-12">
            <label className="form-label small text-muted">Crops to move</label>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Harvested (qtls)</th>
                    <th>Qty to transport (qtls)</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCrops.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Select a plot to see harvested crops.
                      </td>
                    </tr>
                  )}
                  {availableCrops.map((crop) => {
                    const currentQty =
                      (form.crops || []).find((c) => c.name === crop.name)?.quantity || "";
                    return (
                      <tr key={crop.id}>
                        <td>{crop.name}</td>
                        <td>{crop.harvested_qty_total || 0}</td>
                        <td style={{ maxWidth: 160 }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            step="0.1"
                            value={currentQty}
                            onChange={(e) => {
                              const qty = e.target.value;
                              setForm((prev) => {
                                const nextCrops = (prev.crops || []).filter((c) => c.name !== crop.name);
                                if (qty !== "" && Number(qty) > 0) {
                                  nextCrops.push({ name: crop.name, quantity: Number(qty) });
                                }
                                return { ...prev, crops: nextCrops };
                              });
                            }}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <small className="text-muted d-block mt-1">
              Enter quantities for one or more harvested crops.
            </small>
          </div>

          {!form.is_shared && (
            <div className="col-12">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                <FaMapMarkedAlt />
                <span className="small">Nearby vehicles (within 100 km of you)</span>
              </div>
              <div className="rounded-3 overflow-hidden" style={{ height: 240, border: "1px solid #eef2f7" }}>
                <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={9} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle center={[userLocation.lat, userLocation.lng]} radius={100000} pathOptions={{ color: "#10b981", fillOpacity: 0.05 }} />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={markerIcon} />
                  {filteredVehicles.map((v) => (
                    <Marker key={v.id} position={[v.latitude, v.longitude]} icon={markerIcon} />
                  ))}
                </MapContainer>
              </div>
              <div className="mt-2">
                {filteredVehicles.length === 0 ? (
                  <div className="text-muted small">No live vehicles in 100 km right now. You can still send the request.</div>
                ) : (
                  <div className="small text-muted">
                    {filteredVehicles.length} vehicle(s) nearby: {nearbySummary}
                    {filteredVehicles.length > 3 ? " ..." : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
