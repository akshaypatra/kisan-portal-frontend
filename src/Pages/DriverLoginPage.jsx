import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import driverService from "../services/driverService";

export default function DriverLoginPage() {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await driverService.login(contact, password);
      localStorage.setItem(
        "driverAuth",
        JSON.stringify({
          contact_number: contact,
          password,
          vehicle_id: data.vehicle_id,
          driver_name: data.driver_name,
          vehicle_number: data.vehicle_number,
        })
      );
      navigate("/driver-dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <h3 className="mb-3">Driver Login</h3>
      {error && <div className="alert alert-warning py-2">{error}</div>}
      <form className="vstack gap-3" onSubmit={handleLogin}>
        <div>
          <label className="form-label">Contact number</label>
          <input
            type="text"
            className="form-control"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-success" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
