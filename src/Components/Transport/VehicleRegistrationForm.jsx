import React, { useMemo, useState } from "react";
import { useTransport } from "./TransportContext";
import { FaTruckLoading, FaUser, FaIdCard, FaPhone } from "react-icons/fa";

const vehicleTypeOptions = [
  { value: "tempo", label: "Tempo" },
  { value: "truck", label: "Truck" },
  { value: "tractor", label: "Tractor" },
];

const initialState = {
  driver_name: "",
  contact_number: "",
  vehicle_number: "",
  capacity_tons: "",
  vehicle_type: "tempo",
  driver_password: "",
};

function VehicleRegistrationForm() {
  const { registerVehicle } = useTransport();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const vehiclePreview = useMemo(() => {
    if (!form.vehicle_number) return "Vehicle id will show up here";
    return form.vehicle_number.toUpperCase();
  }, [form.vehicle_number]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.driver_name.trim() || !form.contact_number.trim() || !form.driver_password.trim()) {
      setError("Driver name, contact number and password are mandatory.");
      return;
    }
    if (!form.vehicle_number.trim()) {
      setError("Vehicle number / plate is mandatory.");
      return;
    }
    if (!form.capacity_tons || Number(form.capacity_tons) <= 0) {
      setError("Provide a positive capacity (in tons).");
      return;
    }

    setSubmitting(true);
    try {
      await registerVehicle(form);
      setSuccess("Vehicle has been registered.");
      setForm(initialState);
      setTimeout(() => setSuccess(""), 3200);
    } catch (err) {
      console.error(err);
      setError("Unable to register vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4">
      <div className="card-body p-4">
        <h5 className="fw-semibold d-flex align-items-center gap-2 mb-1">
          <FaTruckLoading /> Register vehicle
        </h5>
        <p className="text-muted mb-4">Capture transport capacity for load allocation.</p>

        {error && (
          <div className="alert alert-warning py-2" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success py-2" role="alert">
            {success}
          </div>
        )}

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label small text-muted">Driver name</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                type="text"
                name="driver_name"
                className="form-control"
                placeholder="e.g. Ramesh Kulkarni"
                value={form.driver_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-12">
            <label className="form-label small text-muted">Contact number</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaPhone />
              </span>
              <input
                type="tel"
                name="contact_number"
                className="form-control"
                placeholder="+91 98xx xxxxx"
                value={form.contact_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Vehicle number</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaIdCard />
              </span>
              <input
                type="text"
                name="vehicle_number"
                className="form-control"
                placeholder="e.g. MH12 AB 1234"
                value={form.vehicle_number}
                onChange={(e) =>
                  handleChange({
                    target: { name: "vehicle_number", value: e.target.value.toUpperCase() },
                  })
                }
              />
            </div>
            <small className="text-muted">Preview: {vehiclePreview}</small>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Capacity (tons)</label>
            <input
              type="number"
              name="capacity_tons"
              className="form-control"
              min="0"
              step="0.1"
              placeholder="10"
              value={form.capacity_tons}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Vehicle type</label>
            <select
              name="vehicle_type"
              className="form-select"
              value={form.vehicle_type}
              onChange={handleChange}
            >
              {vehicleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-muted">Driver password</label>
            <input
              type="password"
              name="driver_password"
              className="form-control"
              placeholder="Create driver password"
              value={form.driver_password}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-success" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Register vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleRegistrationForm;
