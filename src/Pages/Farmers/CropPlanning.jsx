import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const PLOTS_ENDPOINT = "/api/plots";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function CropPlanning() {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [planItems, setPlanItems] = useState(() => {
    try {
      const cached = localStorage.getItem(`crop-plan-${plotId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    crop: "",
    area: "",
    startDate: "",
    notes: "",
  });

  const declaredArea = Number(plot?.user_provided_area) || 0;
  const usedAreaFromCycles = useMemo(() => {
    if (!plot?.crop_cycles) return 0;
    return plot.crop_cycles.reduce((sum, cycle) => sum + (Number(cycle.area_acres) || 0), 0);
  }, [plot]);
  const availableArea = Math.max(0, +(declaredArea - usedAreaFromCycles).toFixed(2));
  const plannedArea = useMemo(
    () => planItems.reduce((sum, item) => sum + (Number(item.area) || 0), 0),
    [planItems]
  );
  const remainingAfterPlan = Math.max(0, +(availableArea - plannedArea).toFixed(2));

  useEffect(() => {
    fetchPlotDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotId]);

  useEffect(() => {
    try {
      localStorage.setItem(`crop-plan-${plotId}`, JSON.stringify(planItems));
    } catch {
      // ignore storage errors
    }
  }, [plotId, planItems]);

  async function fetchPlotDetails() {
    const user = getCurrentUser();
    if (!user?.id) {
      setError("Log in to plan crops for your plots.");
      setPlot(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`${PLOTS_ENDPOINT}/with-cycles/${user.id}`);
      const list = Array.isArray(data) ? data : [];
      const match = list.find((p) => String(p.id) === String(plotId));
      if (!match) {
        setError("Plot not found for your account.");
        setPlot(null);
      } else {
        setPlot(match);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load plot details.";
      setError(msg);
      setPlot(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function addPlanItem(e) {
    e.preventDefault();
    if (!form.crop.trim()) {
      setMessage("Enter a crop name.");
      return;
    }
    const areaValue = Number(form.area);
    if (!areaValue || areaValue <= 0) {
      setMessage("Area should be greater than zero.");
      return;
    }
    if (areaValue > remainingAfterPlan + 0.001) {
      setMessage("Area exceeds remaining free land.");
      return;
    }
    const newItem = {
      id: `plan-${Date.now()}`,
      crop: form.crop.trim(),
      area: areaValue,
      startDate: form.startDate || "",
      notes: form.notes || "",
    };
    setPlanItems((prev) => [...prev, newItem]);
    setForm({ crop: "", area: "", startDate: "", notes: "" });
    setMessage("Added crop plan entry.");
    setTimeout(() => setMessage(""), 2500);
  }

  function removePlanItem(itemId) {
    setPlanItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearPlan() {
    setPlanItems([]);
    setMessage("Cleared plan for this plot.");
    setTimeout(() => setMessage(""), 2000);
  }

  function markPlanAsReady() {
    setMessage("Plan saved locally. Share with agronomist or seed seller for execution.");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Back
        </button>
        <h3 className="mb-0">Crop Planning</h3>
        <div />
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      {message && !error && <div className="alert alert-success py-2">{message}</div>}

      {loading && <div className="alert alert-info">Loading plot details...</div>}

      {!loading && plot && (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between flex-wrap gap-3">
                <div>
                  <h5 className="mb-1">{plot.plot_name}</h5>
                  <div className="text-muted small">
                    Plot ID #{plot.id} • Total area: {declaredArea || "-"} acres
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-success">Free area: {availableArea} ac</div>
                  <div className="small text-muted">Used by current crops: {usedAreaFromCycles.toFixed(2)} ac</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-5">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="mb-3">Add crop idea</h5>
                  <form onSubmit={addPlanItem} className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Crop</label>
                      <input
                        className="form-control"
                        value={form.crop}
                        onChange={(e) => handleFormChange("crop", e.target.value)}
                        placeholder="e.g. Chickpea"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Area (acres)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="form-control"
                        value={form.area}
                        onChange={(e) => handleFormChange("area", e.target.value)}
                      />
                      <div className="form-text">Remaining free land: {remainingAfterPlan} ac</div>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Expected sowing</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.startDate}
                        onChange={(e) => handleFormChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes / Inputs needed</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => handleFormChange("notes", e.target.value)}
                        placeholder="Fertilizer plan, irrigation, preferred seed variety..."
                      />
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button type="submit" className="btn btn-success">
                        <FaPlus className="me-2" />
                        Add to plan
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={clearPlan}>
                        Clear plan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Planned crops</h5>
                    <span className="badge bg-light text-dark">
                      Planned {plannedArea.toFixed(2)} / {availableArea.toFixed(2)} ac
                    </span>
                  </div>
                  {planItems.length === 0 ? (
                    <div className="text-muted">Add crops to see your plan summary.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Crop</th>
                            <th>Area (ac)</th>
                            <th>Sowing</th>
                            <th>Notes</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {planItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.crop}</td>
                              <td>{item.area}</td>
                              <td>{item.startDate || "-"}</td>
                              <td style={{ maxWidth: 240 }}>{item.notes || "-"}</td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removePlanItem(item.id)}
                                  title="Remove entry"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      Remaining free land after plan: <strong>{remainingAfterPlan} ac</strong>
                    </div>
                    <button className="btn btn-primary" onClick={markPlanAsReady} disabled={planItems.length === 0}>
                      Save plan snapshot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
