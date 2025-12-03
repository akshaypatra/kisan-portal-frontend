import React, { useEffect, useMemo, useState } from "react";
import { FaCrosshairs, FaMapMarkerAlt, FaWarehouse } from "react-icons/fa";
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useStorage } from "./StorageContext";
import CONFIG from "../../config";

const initialForm = {
  name: "",
  owner_type: "storage_business",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
  offloadingSlots: "",
  capacity_t: "",
  storageType: "dry",
};

const ownerTypeOptions = [
  { value: "storage_business", label: "Storage Business" },
  { value: "fpo", label: "FPO" },
  { value: "company_center", label: "Company Collection Center" },
];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 21.1458, lng: 79.0882 };
const GOOGLE_LIBRARIES = ["places"];
const GOOGLE_LOADER_ID = "storage-google-map-script";
const AUTOCOMPLETE_FIELDS = ["formatted_address", "geometry", "address_components", "name"];
const MAP_OPTIONS = {
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  rotateControl: false,
  keyboardShortcuts: false,
  clickableIcons: false,
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function StorageFacilityForm() {
  const { createFacility } = useStorage();
  const storedUser = useMemo(() => getStoredUser(), []);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    owner_type: storedUser?.storage_owner_type || initialForm.owner_type,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [geoError, setGeoError] = useState("");
  const mapsApiKey = CONFIG.GOOGLE_MAPS_API_KEY;
  const [sessionToken, setSessionToken] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const ownerTypeLocked = Boolean(storedUser?.storage_owner_type);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_LOADER_ID,
    googleMapsApiKey: mapsApiKey || undefined,
    libraries: GOOGLE_LIBRARIES,
  });
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [isLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.state) {
      setSubmitError("Please fill out all mandatory fields.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        name: form.name,
        owner_type: form.owner_type,
        address: form.address,
        city: form.city,
        state: form.state,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        offloading_slots: Number(form.offloadingSlots) || 0,
        capacity_t: Number(form.capacity_t) || 0,
        storage_type: form.storageType,
      };
      await createFacility(payload);
      setForm((prev) => ({ ...initialForm, owner_type: storedUser?.storage_owner_type || initialForm.owner_type }));
      setSuccess("Facility submitted for onboarding");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to save facility", error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save facility";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPosition = useMemo(() => {
    if (!form.latitude || !form.longitude) return null;
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  }, [form.latitude, form.longitude]);

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place) return;
    const location = place.geometry?.location;
    const components = place.address_components || [];

    const getComponent = (type) => {
      const component = components.find((c) => c.types?.includes(type));
      return component ? component.long_name : "";
    };

    setForm((prev) => ({
      ...prev,
      address: place.formatted_address || place.name || prev.address,
      city:
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        prev.city,
      state: getComponent("administrative_area_level_1") || prev.state,
      latitude: location ? location.lat().toFixed(6) : prev.latitude,
      longitude: location ? location.lng().toFixed(6) : prev.longitude,
    }));
    if (window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  };

  const useCurrentLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
      },
      (err) => {
        setGeoError(err.message || "Unable to fetch location.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaWarehouse /> Register storage facility
            </h5>
            <small className="text-muted">
              Capture core attributes for onboarding and visibility
            </small>
          </div>
        </div>

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label small text-muted">Facility name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., GreenPalm Storage Hub"
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Owner type</label>
            <select
              className="form-select"
              name="owner_type"
              value={form.owner_type}
              onChange={handleChange}
              required
              disabled={ownerTypeLocked}
            >
              {ownerTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {ownerTypeLocked && (
              <small className="text-muted">
                Managed from your account registration details.
              </small>
            )}
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, block, village"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">City / District</label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">State</label>
            <input
              type="text"
              className="form-control"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label small text-muted d-flex align-items-center gap-2">
                <FaMapMarkerAlt /> Location selector
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={useCurrentLocation}
              >
                <FaCrosshairs /> Use current location
              </button>
            </div>
            {mapsApiKey && isLoaded && (
              <Autocomplete
                onLoad={(auto) => setAutocomplete(auto)}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  fields: AUTOCOMPLETE_FIELDS,
                  componentRestrictions: { country: "in" },
                  types: ["establishment"],
                  sessionToken,
                }}
              >
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Search facility location (auto-suggest)"
                />
              </Autocomplete>
            )}
            <div className="rounded-4 overflow-hidden border" style={{ height: 220 }}>
              {!mapsApiKey && (
                <div className="d-flex h-100 w-100 align-items-center justify-content-center text-muted text-center p-3">
                  Provide a Google Maps API key via REACT_APP_GOOGLE_MAPS_API_KEY to enable map
                  picking.
                </div>
              )}
              {mapsApiKey && !isLoaded && (
                <div className="d-flex h-100 w-100 align-items-center justify-content-center text-muted">
                  Loading Google Maps...
                </div>
              )}
              {mapsApiKey && isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={selectedPosition || defaultCenter}
                  zoom={selectedPosition ? 12 : 5}
                  onClick={(event) => {
                    if (!event.latLng) return;
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    setForm((prev) => ({
                      ...prev,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6),
                    }));
                  }}
                  options={MAP_OPTIONS}
                >
                  {selectedPosition && <Marker position={selectedPosition} />}
                </GoogleMap>
              )}
            </div>
            {geoError && <div className="text-danger small mt-1">{geoError}</div>}
          </div>
          <input type="hidden" name="latitude" value={form.latitude} readOnly />
          <input type="hidden" name="longitude" value={form.longitude} readOnly />

          <div className="col-md-6">
            <label className="form-label small text-muted">Off-loading bays / slots</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="offloadingSlots"
              value={form.offloadingSlots}
              onChange={handleChange}
              placeholder="4"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Total capacity (tons)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="capacity_t"
              value={form.capacity_t}
              onChange={handleChange}
              placeholder="1500"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label small text-muted">Storage type</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="storageType"
                  id="storageTypeDry"
                  value="dry"
                  checked={form.storageType === "dry"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="storageTypeDry">
                  Normal Warehouse
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="storageType"
                  id="storageTypeCold"
                  value="cold"
                  checked={form.storageType === "cold"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="storageTypeCold">
                  Cold Storage
                </label>
              </div>
            </div>
          </div>

          {submitError && <div className="text-danger small">{submitError}</div>}

          <div className="d-flex justify-content-between align-items-center">
            {success && <span className="text-success small">{success}</span>}
            <button className="btn btn-success" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Save facility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
