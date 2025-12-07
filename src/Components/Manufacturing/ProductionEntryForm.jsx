import React, { useState } from "react";
import manufacturingService from "../../services/manufacturingService";

export default function ProductionEntryForm({ facilityId, onSuccess }) {
  const [formData, setFormData] = useState({
    production_date: new Date().toISOString().split("T")[0],
    crop_name: "",
    raw_material_used_t: "",
    oil_extracted_t: "",
    oil_cake_produced_t: "",
    waste_t: "0",
    notes: "",
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

    // Validate
    if (!formData.crop_name || !formData.raw_material_used_t || !formData.oil_extracted_t || !formData.oil_cake_produced_t) {
      setError("Please fill all required fields");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        production_date: formData.production_date,
        crop_name: formData.crop_name,
        raw_material_used_t: parseFloat(formData.raw_material_used_t),
        oil_extracted_t: parseFloat(formData.oil_extracted_t),
        oil_cake_produced_t: parseFloat(formData.oil_cake_produced_t),
        waste_t: parseFloat(formData.waste_t || 0),
        notes: formData.notes || null,
      };

      await manufacturingService.createProductionLog(facilityId, payload);

      // Calculate extraction rate for display
      const extractionRate = (payload.oil_extracted_t / payload.raw_material_used_t * 100).toFixed(2);

      setSuccess(`Production log saved successfully! Extraction rate: ${extractionRate}%`);

      // Reset form
      setFormData({
        production_date: new Date().toISOString().split("T")[0],
        crop_name: "",
        raw_material_used_t: "",
        oil_extracted_t: "",
        oil_cake_produced_t: "",
        waste_t: "0",
        notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving production log:", err);
      setError(err?.response?.data?.detail || "Failed to save production log");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate real-time extraction rate
  const extractionRate =
    formData.raw_material_used_t && formData.oil_extracted_t
      ? ((parseFloat(formData.oil_extracted_t) / parseFloat(formData.raw_material_used_t)) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <h5 className="mb-3">
          <i className="bi bi-clipboard-data me-2"></i>
          Daily Production Entry
        </h5>
        <p className="small text-muted mb-3">
          Manually enter today's production data. Factory manager fills this form daily - NO IOT sensors needed!
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Production Date *</label>
              <input
                type="date"
                className="form-control"
                name="production_date"
                value={formData.production_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Seed Type (Crop) *</label>
              <select
                className="form-select"
                name="crop_name"
                value={formData.crop_name}
                onChange={handleChange}
                required
              >
                <option value="">Select seed type...</option>
                <option value="Mustard">Mustard Seeds</option>
                <option value="Sunflower">Sunflower Seeds</option>
                <option value="Soybean">Soybean</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Safflower">Safflower</option>
                <option value="Sesame">Sesame</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-box-fill me-1 text-primary"></i>
                Raw Material Used (tons) *
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="raw_material_used_t"
                value={formData.raw_material_used_t}
                onChange={handleChange}
                placeholder="e.g., 15.5"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-droplet-fill me-1 text-success"></i>
                Oil Extracted (tons) *
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="oil_extracted_t"
                value={formData.oil_extracted_t}
                onChange={handleChange}
                placeholder="e.g., 5.4"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-cake2-fill me-1 text-warning"></i>
                Oil Cake Produced (tons) *
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="oil_cake_produced_t"
                value={formData.oil_cake_produced_t}
                onChange={handleChange}
                placeholder="e.g., 9.2"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                <i className="bi bi-trash-fill me-1 text-danger"></i>
                Waste (tons)
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="waste_t"
                value={formData.waste_t}
                onChange={handleChange}
                placeholder="e.g., 0.4"
              />
            </div>

            <div className="col-12">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-control"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Any observations, quality issues, or remarks..."
              ></textarea>
            </div>

            {/* Real-time Extraction Rate Display */}
            <div className="col-12">
              <div className="alert alert-info py-2">
                <strong>Calculated Extraction Rate:</strong>{" "}
                <span className="fs-5 fw-bold text-primary">{extractionRate}%</span>
                {parseFloat(extractionRate) > 0 && (
                  <span className="ms-2 small">
                    {parseFloat(extractionRate) >= 35
                      ? "(Excellent efficiency)"
                      : parseFloat(extractionRate) >= 30
                      ? "(Good efficiency)"
                      : "(Below average - check process)"}
                  </span>
                )}
              </div>
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Saving..." : "Save Production Log"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
