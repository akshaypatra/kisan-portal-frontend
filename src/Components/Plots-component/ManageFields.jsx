import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaSeedling,
  FaMap,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * ManageFields.jsx (earthy theme — avoids red)
 *
 * - Local sample JSON
 * - Delete/Errors use warning/amber instead of red
 * - Crop badges use an earthy color palette
 */

export default function ManageFields() {
  const navigate = useNavigate();

  // ---------- SAMPLE DATA (wrapped in useMemo to keep stable reference) ----------
  const sampleFields = useMemo(
    () => [
      {
        id: 101,
        name: "Riverside Plot",
        area_ha: 2.4,
        stage: "Flowering",
        crops: [
          { name: "Wheat", ratio: 60 },
          { name: "Mustard", ratio: 40 },
        ],
        last_updated: "2025-11-20",
      },
      {
        id: 102,
        name: "North Plot",
        area_ha: 1.1,
        stage: "Sowing",
        crops: [{ name: "Maize", ratio: 100 }],
        last_updated: "2025-11-18",
      },
      {
        id: 103,
        name: "South Orchard",
        area_ha: 0.8,
        stage: "Harvesting",
        crops: [
          { name: "Tomato", ratio: 70 },
          { name: "Chili", ratio: 20 },
          { name: "Basil", ratio: 10 },
        ],
        last_updated: "2025-11-21",
      },
      {
        id: 104,
        name: "West Meadow",
        area_ha: 1.9,
        stage: "Growing",
        crops: [
          { name: "Wheat", ratio: 50 },
          { name: "Barley", ratio: 50 },
        ],
        last_updated: "2025-11-19",
      },
    ],
    []
  );

  // Earthy palette for crop badges
  const cropPalette = [
    "#7BB661", // green
    "#E9C46A", // warm yellow
    "#F4A261", // soft orange
    "#A873FF", // muted purple
    "#8AB6D6", // soft blue
    "#6B8E23", // olive
    "#DDA15E", // amber
  ];

  // ---------- state ----------
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // {type,msg}

  // Modal state for edit/create
  const [editing, setEditing] = useState(false);
  const [editField, setEditField] = useState(null); // object being edited
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });
  const [deleting, setDeleting] = useState(false);

  // ---------- initialize with sample data ----------
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setFields(sampleFields);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [sampleFields]);

  // ---------- helpers ----------
  function openEditModal(field = null) {
    if (field) {
      setEditField(JSON.parse(JSON.stringify(field)));
    } else {
      setEditField({
        name: "",
        area_ha: "",
        stage: "Sowing",
        crops: [{ name: "", ratio: 100 }],
      });
    }
    setEditing(true);
  }

  function closeEditModal() {
    setEditing(false);
    setEditField(null);
  }

  function updateEditField(path, value) {
    setEditField((prev) => {
      const next = { ...prev };
      next[path] = value;
      return next;
    });
  }

  function updateCrop(idx, key, value) {
    setEditField((prev) => {
      const next = { ...prev };
      next.crops = next.crops.map((c, i) => (i === idx ? { ...c, [key]: value } : c));
      return next;
    });
  }

  function addCropRow() {
    setEditField((prev) => ({ ...prev, crops: [...prev.crops, { name: "", ratio: 0 }] }));
  }

  function removeCropRow(idx) {
    setEditField((prev) => {
      const next = { ...prev };
      next.crops = next.crops.filter((_, i) => i !== idx);
      return next;
    });
  }

  function validateFieldPayload(payload) {
    if (!payload.name || payload.name.trim().length < 2) return "Name is required.";
    if (!payload.area_ha || Number.isNaN(Number(payload.area_ha)) || Number(payload.area_ha) <= 0)
      return "Area (ha) must be a positive number.";
    if (!payload.crops || payload.crops.length === 0) return "Add at least one crop.";
    const totalRatio = payload.crops.reduce((s, c) => s + Number(c.ratio || 0), 0);
    if (totalRatio <= 0) return "Total crop ratio must be > 0.";
    return null;
  }

  // ---------- Local save (create / update) ----------
  async function saveField() {
    const payload = {
      ...editField,
      area_ha: Number(editField.area_ha),
      crops: editField.crops.map((c) => ({ name: c.name, ratio: Number(c.ratio) })),
    };

    const validationError = validateFieldPayload(payload);
    if (validationError) {
      setAlert({ type: "warning", msg: validationError });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setSaving(true);
    try {
      if (payload.id) {
        const updated = { ...payload, last_updated: new Date().toISOString().slice(0, 10) };
        setFields((prev) => prev.map((f) => (f.id === payload.id ? updated : f)));
        setAlert({ type: "success", msg: "Field updated (local)." });
      } else {
        const newId = Math.max(0, ...fields.map((f) => f.id || 0)) + 1;
        const created = { ...payload, id: newId, last_updated: new Date().toISOString().slice(0, 10) };
        setFields((prev) => [created, ...prev]);
        setAlert({ type: "success", msg: "Field created (local)." });
      }
      closeEditModal();
    } catch (err) {
      console.error(err);
      setAlert({ type: "warning", msg: "Failed to save field." }); // use warning instead of danger (no red)
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  }

  // ---------- Local delete ----------
  function requestDelete(id, name) {
    setDeleteConfirm({ open: true, id, name });
  }

  async function confirmDelete() {
    const { id } = deleteConfirm;
    if (!id) return;
    setDeleting(true);
    try {
      setFields((prev) => prev.filter((f) => f.id !== id));
      setAlert({ type: "success", msg: "Field deleted (local)." });
    } catch (err) {
      console.error(err);
      setAlert({ type: "warning", msg: "Failed to delete field." }); // use warning instead of danger
    } finally {
      setDeleting(false);
      setDeleteConfirm({ open: false, id: null, name: "" });
      setTimeout(() => setAlert(null), 3000);
    }
  }

  // UI helper
  //eslint-disable-next-line no-unused-vars
  function totalCropString(crops) {
    if (!crops || crops.length === 0) return "—";
    return crops.map((c) => `${c.name} (${c.ratio}%)`).join(", ");
  }

  // ---------- Render ----------
  return (
    <div className="manage-fields container py-4">
      <style>{`
        .page-hero {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:18px;
        }
        .hero-title { display:flex; gap:12px; align-items:center; }
        .page-card {
          background: linear-gradient(180deg, #ffffff, #fbfffb);
          border-radius:12px;
          padding:16px;
          box-shadow: 0 10px 26px rgba(18, 52, 30, 0.06);
        }
        .field-row {
          transition: box-shadow .18s, transform .18s;
        }
        .field-row:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(10,45,20,0.06); }
        .small-muted { color:#6c757d; font-size:13px; }
        .crop-badge {
          display:inline-block; padding:6px 10px; border-radius:999px; margin-right:8px; margin-bottom:6px; font-weight:700; color:#fff;
        }
        .action-btn { min-width:38px; }
      `}</style>

      <div className="page-hero">
        <div className="hero-title">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ width: 58, height: 58, borderRadius: 12, background: "#eef8ee", color: "#2f7a3a" }}
          >
            <FaMap size={26} />
          </div>
          <div>
            <h3 className="mb-0" style={{ color: "#1f4d2e" }}>Manage Fields</h3>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/plot-registration")} title="Register new plot">
            <FaPlus style={{ marginRight: 8 }} /> New Plot
          </button>

          <button className="btn btn-success" onClick={() => openEditModal(null)}>
            <FaSeedling style={{ marginRight: 8 }} /> Add Field
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type === "danger" ? "warning" : alert.type} py-2`} role="alert">
          {alert.msg}
        </div>
      )}

      <div className="page-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong style={{ color: "#184723" }}>All fields</strong>
            <div className="small-muted">Total: {fields.length}</div>
          </div>
          <div>
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setFields(sampleFields);
                  setLoading(false);
                }, 200);
              }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Reset (sample)"}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/dashboard")}>
              Back
            </button>
          </div>
        </div>

        {/* Grid of cards (responsive) */}
        <div className="row g-3">
          {fields.length === 0 && !loading && (
            <div className="col-12">
              <div className="p-4 text-center text-muted">No fields yet. Click "Add Field" to create one.</div>
            </div>
          )}

          {fields.map((f) => (
            <div key={f.id} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card field-row w-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div style={{ fontWeight: 800, color: "#153d2b" }}>{f.name}</div>
                      <div className="small-muted">
                        {f.stage} • {f.area_ha} ha
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="small-muted">Updated</div>
                      <div style={{ fontWeight: 700 }}>{f.last_updated ?? "—"}</div>
                    </div>
                  </div>

                  <hr />

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Crops</div>
                    <div>
                      {f.crops && f.crops.length > 0 ? (
                        f.crops.map((c, i) => (
                          <span
                            key={i}
                            className="crop-badge"
                            style={{
                              background: cropPalette[i % cropPalette.length],
                              boxShadow: "0 4px 12px rgba(10,40,20,0.06)",
                            }}
                          >
                            {c.name} • {c.ratio}%
                          </span>
                        ))
                      ) : (
                        <div className="text-muted">No crop data</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2 action-btn"
                        title="Edit field"
                        onClick={() => openEditModal(f)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning action-btn"
                        title="Delete field"
                        onClick={() => requestDelete(f.id, f.name)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- EDIT / CREATE MODAL ---------- */}
      {editing && editField && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.28)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ background: "#f7fbf7" }}>
                <h5 className="modal-title" style={{ color: "#184723" }}>{editField.id ? "Edit Field" : "Add Field"}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeEditModal}></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Field name</label>
                    <input className="form-control" value={editField.name} onChange={(e) => updateEditField("name", e.target.value)} placeholder="e.g. North Plot" />
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label">Area (ha)</label>
                    <input
                      className="form-control"
                      value={editField.area_ha}
                      onChange={(e) => updateEditField("area_ha", e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label">Stage</label>
                    <select className="form-select" value={editField.stage} onChange={(e) => updateEditField("stage", e.target.value)}>
                      <option>Sowing</option>
                      <option>Growing</option>
                      <option>Flowering</option>
                      <option>Harvesting</option>
                      <option>Fallow</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Crops (name & ratio %)</label>

                    {editField.crops.map((c, i) => (
                      <div key={i} className="input-group mb-2">
                        <input className="form-control" placeholder="Crop name" value={c.name} onChange={(e) => updateCrop(i, "name", e.target.value)} />
                        <input
                          className="form-control"
                          placeholder="Ratio %"
                          type="number"
                          min="0"
                          max="100"
                          value={c.ratio}
                          onChange={(e) => updateCrop(i, "ratio", e.target.value)}
                          style={{ maxWidth: 120 }}
                        />
                        <button className="btn btn-outline-secondary" onClick={() => removeCropRow(i)} type="button">
                          <FaTimes />
                        </button>
                      </div>
                    ))}

                    <div className="mt-2">
                      <button className="btn btn-sm btn-outline-success" onClick={addCropRow}>
                        <FaPlus style={{ marginRight: 8 }} /> Add crop
                      </button>
                      <div className="small-muted mt-2">Make sure crop ratios sum to 100 for clarity (not enforced).</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeEditModal} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={saveField} disabled={saving}>
                  {saving ? "Saving..." : (<><FaSave style={{ marginRight: 8 }} /> Save</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DELETE CONFIRM ---------- */}
      {deleteConfirm.open && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.28)" }}>
          <div className="modal-dialog modal-sm" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ background: "#fff7ed" }}>
                <h5 className="modal-title" style={{ color: "#8a5b00" }}>Delete field</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn btn-warning" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
