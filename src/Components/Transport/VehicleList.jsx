import React from "react";
import { useTransport } from "./TransportContext";
import { FaTruck, FaPhoneAlt, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const typeBadges = {
  tempo: { label: "Tempo", color: "#1e88e5" },
  truck: { label: "Truck", color: "#8e24aa" },
  tractor: { label: "Tractor", color: "#f4511e" },
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function VehicleCard({ vehicle }) {
  const meta = typeBadges[vehicle.vehicle_type] || typeBadges.tempo;
  const hasLocation =
    vehicle.latitude !== null &&
    vehicle.latitude !== undefined &&
    vehicle.longitude !== null &&
    vehicle.longitude !== undefined;

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-uppercase text-muted small">Driver</div>
            <h5 className="mb-1">{vehicle.driver_name}</h5>
          </div>
          <span
            className="badge text-white"
            style={{ backgroundColor: meta.color, borderRadius: 999, padding: "6px 12px" }}
          >
            {meta.label}
          </span>
        </div>

        <div className="mt-3 d-flex gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 text-muted">
            <FaIdCard />
            <span className="fw-semibold">{vehicle.vehicle_number}</span>
          </div>
          <div className="d-flex align-items-center gap-2 text-muted">
            <FaTruck />
            <span>{vehicle.capacity_tons} tons</span>
          </div>
        </div>

        <div className="mt-2 d-flex align-items-center gap-2 text-muted">
          <FaPhoneAlt />
          <span>{vehicle.contact_number}</span>
        </div>

        {hasLocation && (
          <div className="mt-3">
            <div className="d-flex align-items-center gap-2 text-muted small mb-2">
              <FaMapMarkerAlt />
              <span>
                {vehicle.latitude}, {vehicle.longitude}
                {vehicle.location_updated_at ? ` · updated ${vehicle.location_updated_at}` : ""}
              </span>
            </div>
            <div className="rounded-3 overflow-hidden" style={{ height: 180, border: "1px solid #eef2f7" }}>
              <MapContainer
                center={[vehicle.latitude, vehicle.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                zoomControl={false}
                dragging={false}
                doubleClickZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[vehicle.latitude, vehicle.longitude]} icon={markerIcon} />
              </MapContainer>
            </div>
          </div>
        )}

        {vehicle.notes && <p className="text-muted small mt-3 mb-0">{vehicle.notes}</p>}
      </div>
    </div>
  );
}

function VehicleList() {
  const { vehicles, loading, error } = useTransport();

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-semibold mb-1">Available vehicles</h5>
            <p className="text-muted mb-0">Fleet registered under this transporter.</p>
          </div>
          <span className="badge bg-light text-dark rounded-pill">{vehicles.length}</span>
        </div>

        {error && (
          <div className="alert alert-warning py-2" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 text-muted">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-4 text-muted">No vehicles registered yet.</div>
        ) : (
          <div className="row g-3">
            {vehicles.map((vehicle) => (
              <div className="col-12 col-md-6" key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleList;
