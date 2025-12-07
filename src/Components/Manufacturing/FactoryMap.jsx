import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import CONFIG from "../../config";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: 20.5937, // Center of India
  lng: 78.9629,
};

export default function FactoryMap({ factory, storageLocations = [] }) {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(5);

  const { isLoaded } = useJsApiLoader({
    id: "factory-map",
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (factory && factory.latitude && factory.longitude) {
      setCenter({
        lat: parseFloat(factory.latitude),
        lng: parseFloat(factory.longitude),
      });
      setZoom(7);
    }
  }, [factory]);

  if (!isLoaded) {
    return (
      <div className="card shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading map...</span>
          </div>
          <p className="mt-2 text-muted">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
              Factory Location & Procurement Radius
            </h5>
            <small className="text-muted">
              {factory ? (
                <>
                  {factory.name} - {factory.city}, {factory.state}
                </>
              ) : (
                "Loading..."
              )}
            </small>
          </div>
          {factory && (
            <div className="text-end">
              <div className="badge bg-success">{factory.procurement_radius_km} km radius</div>
            </div>
          )}
        </div>

        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom}>
          {/* Factory Marker */}
          {factory && factory.latitude && factory.longitude && (
            <>
              <Marker
                position={{
                  lat: parseFloat(factory.latitude),
                  lng: parseFloat(factory.longitude),
                }}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                title={factory.name}
                label={{
                  text: "🏭",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />

              {/* Procurement Radius Circle */}
              <Circle
                center={{
                  lat: parseFloat(factory.latitude),
                  lng: parseFloat(factory.longitude),
                }}
                radius={factory.procurement_radius_km * 1000} // Convert km to meters
                options={{
                  strokeColor: "#4CAF50",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#4CAF50",
                  fillOpacity: 0.1,
                }}
              />
            </>
          )}

          {/* Storage Facility Markers */}
          {storageLocations.map((storage, idx) => (
            <Marker
              key={idx}
              position={{
                lat: parseFloat(storage.latitude),
                lng: parseFloat(storage.longitude),
              }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              title={`${storage.storage_facility_name} - ${storage.available_quantity_t.toFixed(1)}t available`}
              label={{
                text: "🏪",
                fontSize: "18px",
              }}
            />
          ))}
        </GoogleMap>

        {/* Legend */}
        <div className="mt-3 d-flex gap-4 justify-content-center">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "24px" }}>🏭</span>
            <span className="small">Your Factory</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "20px" }}>🏪</span>
            <span className="small">Storage Facilities (with stock)</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "2px solid #4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              }}
            ></div>
            <span className="small">Procurement Radius</span>
          </div>
        </div>

        {storageLocations.length > 0 && (
          <div className="alert alert-info mt-3 py-2">
            <i className="bi bi-info-circle me-2"></i>
            <strong>{storageLocations.length} storage facilities</strong> found within your {factory?.procurement_radius_km}km
            procurement radius with available stock.
          </div>
        )}
      </div>
    </div>
  );
}
