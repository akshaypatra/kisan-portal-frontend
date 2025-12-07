import React, { useState } from "react";
import manufacturingService from "../../services/manufacturingService";

export default function RegisterFacility({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    facility_type: "oil_mill",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    daily_capacity_t: "",
    raw_material_storage_capacity_t: "",
    procurement_radius_km: "600",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name,
        facility_type: formData.facility_type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        daily_capacity_t: parseFloat(formData.daily_capacity_t),
        raw_material_storage_capacity_t: parseFloat(formData.raw_material_storage_capacity_t),
        procurement_radius_km: parseInt(formData.procurement_radius_km),
      };

      await manufacturingService.createFacility(payload);

      setSuccess("Manufacturing facility registered successfully!");

      // Reset form
      setFormData({
        name: "",
        facility_type: "oil_mill",
        address: "",
        city: "",
        state: "",
        latitude: "",
        longitude: "",
        daily_capacity_t: "",
        raw_material_storage_capacity_t: "",
        procurement_radius_km: "600",
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      console.error("Error registering facility:", err);
      setError(err?.response?.data?.detail || "Failed to register facility");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <h5 className="mb-3">
          <i className="bi bi-building-add me-2"></i>
          Register Manufacturing Facility
        </h5>
        <p className="small text-muted mb-3">
          Register your oil mill or refinery to start coordinating with the domestic oilseed supply chain.
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Facility Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., ABC Oil Mill"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Facility Type *</label>
              <select
                className="form-select"
                name="facility_type"
                value={formData.facility_type}
                onChange={handleChange}
                required
              >
                <option value="oil_mill">Oil Mill</option>
                <option value="refinery">Refinery</option>
                <option value="integrated">Integrated Mill & Refinery</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Address *</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Maharashtra"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Latitude *
                <small className="text-muted ms-2">(Use Google Maps to find coordinates)</small>
              </label>
              <input
                type="number"
                step="0.000001"
                className="form-control"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 19.076090"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Longitude *
                <small className="text-muted ms-2">(Use Google Maps to find coordinates)</small>
              </label>
              <input
                type="number"
                step="0.000001"
                className="form-control"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 72.877426"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-speedometer2 me-1 text-primary"></i>
                Daily Processing Capacity (tons) *
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="daily_capacity_t"
                value={formData.daily_capacity_t}
                onChange={handleChange}
                placeholder="e.g., 50"
                required
              />
              <small className="text-muted">How many tons of seeds you can process per day</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-box-seam me-1 text-info"></i>
                Raw Material Storage Capacity (tons) *
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="raw_material_storage_capacity_t"
                value={formData.raw_material_storage_capacity_t}
                onChange={handleChange}
                placeholder="e.g., 500"
                required
              />
              <small className="text-muted">Total storage capacity for raw oilseeds</small>
            </div>

            <div className="col-12">
              <label className="form-label">
                <i className="bi bi-geo-alt me-1 text-success"></i>
                Procurement Radius (km) *
              </label>
              <input
                type="number"
                className="form-control"
                name="procurement_radius_km"
                value={formData.procurement_radius_km}
                onChange={handleChange}
                placeholder="500-800 km recommended"
                required
              />
              <small className="text-muted">
                Distance within which you want to procure raw materials. Recommended: 500-800 km for cost optimization.
              </small>
            </div>

            <div className="col-12">
              <div className="alert alert-light border">
                <strong>Note:</strong> Once registered, the system will:
                <ul className="mb-0 mt-2 small">
                  <li>Calculate distances to all storage facilities within your procurement radius</li>
                  <li>Show available oilseeds from farmers and storage centers</li>
                  <li>Provide real-time visibility into domestic supply chain</li>
                  <li>Enable direct procurement with optimized routing</li>
                </ul>
              </div>
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Registering..." : "Register Facility"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
