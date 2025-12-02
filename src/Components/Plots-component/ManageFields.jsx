import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaMap,
  FaTruckLoading,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

/**
 * ManageFields.jsx (earthy theme — avoids red)
 *
 * - Local sample JSON
 * - Delete/Errors use warning/amber instead of red
 * - Crop badges use an earthy color palette
 */

const PLOTS_ENDPOINT = "/api/plots";
const SQM_PER_ACRE = 4046.85642;

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function ManageFields() {
  const navigate = useNavigate();
  const { plotId } = useParams();
  const currentUser = getCurrentUser();
  const farmerId = currentUser?.id;

  // ---------- SAMPLE DATA (wrapped in useMemo to keep stable reference) ----------
  const sampleFields = useMemo(
    () => [
      // {
      //   id: "sample-101",
      //   name: "Riverside Plot",
      //   area_acres: 5.9,
      //   stage: "Flowering",
      //   crops: [
      //     { localId: "s-101-a", name: "Wheat", area_acres: 3.1, stage: "Flowering", harvests: [] },
      //     { localId: "s-101-b", name: "Mustard", area_acres: 2.8, stage: "Growing", harvests: [] },
      //   ],
      //   last_updated: "2025-11-20",
      //   isSample: true,
      // },
      // {
      //   id: "sample-102",
      //   name: "North Plot",
      //   area_acres: 2.7,
      //   stage: "Sowing",
      //   crops: [{ localId: "s-102-a", name: "Maize", area_acres: 2.7, stage: "Sowing", harvests: [] }],
      //   last_updated: "2025-11-18",
      //   isSample: true,
      // },
      // {
      //   id: "sample-103",
      //   name: "South Orchard",
      //   area_acres: 1.9,
      //   stage: "Harvesting",
      //   crops: [
      //     { localId: "s-103-a", name: "Tomato", area_acres: 1.3, stage: "Harvesting", harvests: [] },
      //     { localId: "s-103-b", name: "Chili", area_acres: 0.4, stage: "Growing", harvests: [] },
      //     { localId: "s-103-c", name: "Basil", area_acres: 0.2, stage: "Growing", harvests: [] },
      //   ],
      //   last_updated: "2025-11-21",
      //   isSample: true,
      // },
      // {
      //   id: "sample-104",
      //   name: "West Meadow",
      //   area_acres: 4.6,
      //   stage: "Growing",
      //   crops: [
      //     { localId: "s-104-a", name: "Wheat", area_acres: 2.3, stage: "Growing", harvests: [] },
      //     { localId: "s-104-b", name: "Barley", area_acres: 2.3, stage: "Growing", harvests: [] },
      //   ],
      //   last_updated: "2025-11-19",
      //   isSample: true,
      // },
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
  const [fields, setFields] = useState(sampleFields);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // {type,msg}

  // Modal state for edit/create
  const [editing, setEditing] = useState(false);
  const [editField, setEditField] = useState(null); // object being edited
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });
  const [deleting, setDeleting] = useState(false);
  const [harvestModal, setHarvestModal] = useState({
    open: false,
    fieldId: null,
    cropIndex: null,
    qty: "",
    area: "",
    isFinal: false,
    date: "",
    finalYield: "",
  });
  const [historyModal, setHistoryModal] = useState({ open: false, cropName: "", events: [] });

  // ---------- load plots from backend & merge with samples ----------
  useEffect(() => {
    fetchRemotePlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRemotePlots() {
    if (!farmerId) {
      setFields((prev) => prev.filter((f) => !f.isRemote));
      setAlert({ type: "warning", msg: "Log in to view your registered fields." });
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`${PLOTS_ENDPOINT}/with-cycles/${farmerId}`);
      const mapped = Array.isArray(data) ? data.map(mapPlotToField) : [];
      setFields((prev) => {
        const locals = prev.filter((f) => !f.isRemote);
        return [...mapped, ...locals];
      });
      // setAlert({ type: "success", msg: "Synced plots from server." });
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 404) {
        setFields((prev) => prev.filter((f) => !f.isRemote));
        setAlert({ type: "info", msg: "No plots found for your account yet." });
      } else {
        setAlert({ type: "warning", msg: "Could not reach backend. Showing cached/demo fields." });
      }
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  }

  function mapPlotToField(plot) {
    const area_acres = plot.calculated_area_sqm ? +(plot.calculated_area_sqm / SQM_PER_ACRE).toFixed(2) : 0;
    const stage = (plot.status && (plot.status.stage || plot.status.status)) || "Registered";
    const cropCycles = Array.isArray(plot.crop_cycles) ? plot.crop_cycles : [];
    return {
      id: `db-${plot.id}`,
      dbId: plot.id,
      routeKey: String(plot.id),
      name: plot.plot_name,
      area_acres,
      stage,
      crops: cropCycles
        .filter((c) => c.status !== "harvested")
        .map((c, idx) => ({
          id: c.id,
          cycleId: c.id,
          name: c.crop_name,
          area_acres: c.area_acres,
          stage: c.status,
          sowing_date: c.sowing_date ? c.sowing_date.slice(0, 10) : "",
          harvests: (c.harvest_events || []).map((event) => ({
            id: event.id,
            harvested_on: event.harvested_on,
            harvested_qty: event.harvested_qty,
            harvested_area_acres: event.harvested_area_acres,
          })),
          harvested_qty_total: c.harvested_qty_total || 0,
          harvested_area_total: c.harvested_area_total || 0,
          fromApi: true,
          colorIndex: idx,
        })),
      last_updated: plot.updated_at ? plot.updated_at.slice(0, 10) : "",
      isRemote: true,
    };
  }

  // ---------- helpers ----------
  function openEditModal(field = null) {
    if (field) {
      setEditField({
        ...field,
        crops:
          field.crops && field.crops.length > 0
            ? field.crops.map((c) => ({ ...c }))
            : [{ name: "", area_acres: "", stage: "Growing", sowing_date: "" }],
      });
    } else {
      setEditField({
        name: "",
        area_acres: "",
        stage: "Sowing",
        crops: [{ name: "", area_acres: "", stage: "Growing", sowing_date: "" }],
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
    setEditField((prev) => ({
      ...prev,
      crops: [...prev.crops, { name: "", area_acres: "", stage: "Growing", sowing_date: "" }],
    }));
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
    if (!payload.area_acres || Number.isNaN(Number(payload.area_acres)) || Number(payload.area_acres) <= 0)
      return "Area (acres) must be a positive number.";
    if (!payload.crops || payload.crops.length === 0) return "Add at least one crop.";
    const invalidCrop = payload.crops.find(
      (c) =>
        !c.name ||
        Number.isNaN(Number(c.area_acres)) ||
        Number(c.area_acres) <= 0 ||
        !c.sowing_date
    );
    if (invalidCrop) return "Each crop needs a name, sowing date, and positive area (acres).";
    return null;
  }

  // ---------- Local save (create / update) ----------
  async function saveField() {
    const payload = {
      ...editField,
      area_acres: Number(editField.area_acres),
      crops: editField.crops.map((c) => ({
        name: c.name,
        area_acres: Number(c.area_acres),
        stage: (c.stage || "Growing").toString().toLowerCase(),
        sowing_date: c.sowing_date,
        cycleId: c.cycleId,
        id: c.id,
      })),
    };

    const validationError = validateFieldPayload(payload);
    if (validationError) {
      setAlert({ type: "warning", msg: validationError });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setSaving(true);
    try {
      if (payload.dbId) {
        const newCrops = payload.crops.filter((c) => !c.cycleId && !c.id);
        const createdCrops = [];
        for (const c of newCrops) {
          const { data } = await api.post(`${PLOTS_ENDPOINT}/cycle/create`, {
            plot_id: payload.dbId,
            crop_name: c.name,
            area_acres: c.area_acres,
            sowing_date: c.sowing_date,
            status: c.stage,
          });
          createdCrops.push({
            ...c,
            id: data.id,
            cycleId: data.id,
            stage: data.status,
            sowing_date: data.sowing_date ? data.sowing_date.slice(0, 10) : c.sowing_date,
            harvested_qty_total: data.harvested_qty_total || 0,
            harvested_area_total: data.harvested_area_total || 0,
            fromApi: true,
            harvests: [],
          });
        }
        setFields((prev) =>
          prev.map((f) =>
            f.id === payload.id
              ? {
                  ...f,
                  crops: [...f.crops, ...createdCrops],
                  last_updated: new Date().toISOString().slice(0, 10),
                }
              : f
          )
        );
        setAlert({ type: "success", msg: createdCrops.length > 0 ? "Crop(s) added to plot." : "No changes to save." });
      } else {
        const newId = Math.max(0, ...fields.map((f) => (typeof f.id === "number" ? f.id : 0))) + 1;
        const created = { ...payload, id: newId, last_updated: new Date().toISOString().slice(0, 10) };
        setFields((prev) => [created, ...prev]);
        setAlert({ type: "success", msg: "Field created locally." });
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
  function harvestEventTemplate(qty, area, harvestedOn) {
    return {
      id: `local-${Date.now()}`,
      harvested_on: harvestedOn || new Date().toISOString(),
      harvested_qty: qty,
      harvested_area_acres: area,
    };
  }

  function openHarvestModal(fieldId, cropIndex, isFinal = false) {
    const targetField = fields.find((f) => f.id === fieldId);
    if (!targetField || !targetField.crops || !targetField.crops[cropIndex]) return;
    const targetCrop = targetField.crops[cropIndex];
    setHarvestModal({
      open: true,
      fieldId,
      cropIndex,
      qty: "",
      area: "",
      isFinal,
      maxArea: Math.max(0, (targetCrop.area_acres || 0) - (targetCrop.harvested_area_total || 0)),
      cropName: targetCrop.name,
      date: new Date().toISOString().slice(0, 10),
      finalYield: "",
    });
  }

  function closeHarvestModal() {
    setHarvestModal({
      open: false,
      fieldId: null,
      cropIndex: null,
      qty: "",
      area: "",
      isFinal: false,
      maxArea: 0,
      cropName: "",
      date: "",
      finalYield: "",
    });
  }

  async function submitHarvest() {
    const { fieldId, cropIndex, qty, area, isFinal, date, finalYield } = harvestModal;
    const targetField = fields.find((f) => f.id === fieldId);
    if (!targetField || !targetField.crops || !targetField.crops[cropIndex]) return;
    const targetCrop = targetField.crops[cropIndex];

    const harvestDate = date || new Date().toISOString().slice(0, 10);
    if (!harvestDate) {
      setAlert({ type: "warning", msg: "Select a harvest date." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    const qtyNum = Number(qty);
    const finalYieldNum = isFinal ? Number(finalYield || qty) : null;

    if (!isFinal && (Number.isNaN(qtyNum) || qtyNum <= 0)) {
      setAlert({ type: "warning", msg: "Provide a valid harvest quantity." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    if (isFinal && (Number.isNaN(finalYieldNum) || finalYieldNum <= 0)) {
      setAlert({ type: "warning", msg: "Provide the final yield amount." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    const areaNum = area ? Number(area) : 0;
    if (!isFinal && area && (Number.isNaN(areaNum) || areaNum < 0)) {
      setAlert({ type: "warning", msg: "Area must be a positive number." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    const remainingArea = Math.max(0, (targetCrop.area_acres || 0) - (targetCrop.harvested_area_total || 0));
    if (isFinal && remainingArea <= 0) {
      setAlert({ type: "warning", msg: "This crop is already fully harvested." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    const effectiveArea = isFinal ? remainingArea || areaNum : (areaNum || remainingArea);
    if (!effectiveArea || effectiveArea > (targetCrop.area_acres || 0) || effectiveArea > remainingArea + 1e-6) {
      setAlert({ type: "warning", msg: "Harvest area exceeds available crop area." });
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    let createdHarvest = null;
    try {
      if (targetField.isRemote && targetCrop.cycleId) {
        if (isFinal) {
          await api.post(`${PLOTS_ENDPOINT}/harvest/final`, {
            crop_cycle_id: targetCrop.cycleId,
            harvested_on: harvestDate,
            final_yield: finalYieldNum,
            qr_url: null,
            blockchain_tx: null,
          });
        } else {
          const { data } = await api.post(`${PLOTS_ENDPOINT}/harvest/partial`, {
            crop_cycle_id: targetCrop.cycleId,
            harvested_on: harvestDate,
            harvested_area_acres: effectiveArea || targetCrop.area_acres,
            harvested_qty: qtyNum,
            qr_url: null,
            blockchain_tx: null,
          });
          createdHarvest = {
            id: data.id,
            harvested_on: data.harvested_on,
            harvested_qty: data.harvested_qty,
            harvested_area_acres: data.harvested_area_acres,
          };
        }
      } else {
        createdHarvest = harvestEventTemplate(isFinal ? finalYieldNum : qtyNum, effectiveArea || null, harvestDate);
      }

      const quantityDelta = isFinal ? finalYieldNum : qtyNum;
      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== fieldId) return f;
          const updatedCrops = f.crops
            .map((c, idx) => {
              if (idx !== cropIndex) return c;
              const nextHarvests =
                createdHarvest && !isFinal ? [...(c.harvests || []), createdHarvest] : c.harvests || [];
              const newHarvestedArea = (c.harvested_area_total || 0) + (effectiveArea || 0);
              const fullyHarvested = isFinal || (effectiveArea && newHarvestedArea + 1e-6 >= (c.area_acres || 0));
              const status = fullyHarvested ? "Harvested" : "Partial harvest";
              return {
                ...c,
                harvests: nextHarvests,
                harvested_qty_total: (c.harvested_qty_total || 0) + (quantityDelta || 0),
                harvested_area_total: newHarvestedArea,
                stage: status,
              };
            })
            .filter((c, idx) => !(isFinal && idx === cropIndex));
          return { ...f, crops: updatedCrops, last_updated: new Date().toISOString().slice(0, 10) };
        })
      );
      setAlert({ type: "success", msg: isFinal ? "Marked as fully harvested." : "Harvest logged." });
      closeHarvestModal();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Could not register harvest.";
      setAlert({ type: "warning", msg });
    } finally {
      setTimeout(() => setAlert(null), 2500);
    }
  }

  function openHistory(crop) {
    setHistoryModal({ open: true, cropName: crop.name, events: crop.harvests || [] });
  }

  function closeHistory() {
    setHistoryModal({ open: false, cropName: "", events: [] });
  }

  const displayedFields = useMemo(() => {
    if (!plotId) return fields;
    return fields.filter((f) => {
      const key = f.routeKey || (f.dbId ? String(f.dbId) : null) || (typeof f.id === "number" ? String(f.id) : `${f.id}`);
      return key === plotId;
    });
  }, [fields, plotId]);

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
            <strong style={{ color: "#184723" }}>{plotId ? "Selected field" : "All fields"}</strong>
            <div className="small-muted">Total: {displayedFields.length}</div>
          </div>
          <div>
            {/* <button
              className="btn btn-outline-primary me-2"
              onClick={() => {
                fetchRemotePlots();
              }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Sync server data"}
            </button> */}
            {/* <button className="btn btn-outline-secondary" onClick={() => navigate("/dashboard")}>
              Back
            </button> */}
          </div>
        </div>

        {/* Grid of cards (responsive) */}
        <div className="row g-3">
          {displayedFields.length === 0 && !loading && (
            <div className="col-12">
              <div className="p-4 text-center text-muted">No fields yet. Click "Add Field" to create one.</div>
            </div>
          )}

          {displayedFields.map((f) => (
            <div key={f.id} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card field-row w-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div style={{ fontWeight: 800, color: "#153d2b" }}>{f.name}</div>
                      <div className="small-muted">
                        {f.stage} | {f.area_acres} ac
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="small-muted">Updated</div>
                      <div style={{ fontWeight: 700 }}>{f.last_updated ?? "-"}</div>
                    </div>
                  </div>

                  <hr />

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Crops</div>
                    <div>
                      {f.crops && f.crops.length > 0 ? (
                        f.crops.map((c, i) => (
                          <div key={i} className="d-flex align-items-center justify-content-between border rounded px-2 py-1 mb-2">
                            <div>
                              <div
                                className="crop-badge"
                                style={{
                                  background: cropPalette[i % cropPalette.length],
                                  boxShadow: "0 4px 12px rgba(10,40,20,0.06)",
                                }}
                              >
                                {c.name} · {c.area_acres} ac
                              </div>
                              <div className="small-muted">Stage: {c.stage}</div>
                              <div className="small-muted">Harvested: {c.harvested_qty_total || 0} kg</div>
                              <div className="small-muted">
                                Remaining: {Math.max(0, (c.area_acres || 0) - (c.harvested_area_total || 0)).toFixed(2)} ac
                              </div>
                            </div>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-success" title="Log partial harvest" onClick={() => openHarvestModal(f.id, i, false)}>
                                <FaTruckLoading style={{ marginRight: 6 }} /> Harvest
                              </button>
                              <button className="btn btn-outline-secondary" title="Mark fully harvested" onClick={() => openHarvestModal(f.id, i, true)}>
                                Full
                              </button>
                              <button className="btn btn-outline-info" title="View harvest history" onClick={() => openHistory(c)}>
                                History
                              </button>
                            </div>
                          </div>
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
                    <label className="form-label">Area (acres)</label>
                    <input
                      className="form-control"
                      value={editField.area_acres}
                      onChange={(e) => updateEditField("area_acres", e.target.value)}
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
                    <label className="form-label">Crops (name, area, stage, sowing date)</label>

                    {editField.crops.map((c, i) => (
                      <div key={i} className="input-group mb-2">
                        <input className="form-control" placeholder="Crop name" value={c.name} onChange={(e) => updateCrop(i, "name", e.target.value)} />
                        <input
                          className="form-control"
                          placeholder="Area (acres)"
                          type="number"
                          min="0"
                          value={c.area_acres}
                          onChange={(e) => updateCrop(i, "area_acres", e.target.value)}
                          style={{ maxWidth: 120 }}
                        />
                        <select className="form-select" style={{ maxWidth: 140 }} value={c.stage || "Growing"} onChange={(e) => updateCrop(i, "stage", e.target.value)}>
                          <option>Growing</option>
                          <option>Sowing</option>
                          <option>Flowering</option>
                          <option>Harvesting</option>
                          <option>Harvested</option>
                        </select>
                        <input
                          type="date"
                          className="form-control"
                          style={{ maxWidth: 160 }}
                          value={c.sowing_date || ""}
                          onChange={(e) => updateCrop(i, "sowing_date", e.target.value)}
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
                      <div className="small-muted mt-2">Track area in acres and set stage per crop. New crops on DB plots create crop cycles.</div>
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

      {/* ---------- HARVEST MODAL ---------- */}
      {harvestModal.open && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.28)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Log {harvestModal.isFinal ? "Final" : "Partial"} Harvest</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeHarvestModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Crop</label>
                  <input className="form-control" value={harvestModal.cropName} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Harvest Date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={harvestModal.date}
                    onChange={(e) => setHarvestModal((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                {!harvestModal.isFinal && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Quantity (quintals)</label>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        value={harvestModal.qty}
                        onChange={(e) => setHarvestModal((p) => ({ ...p, qty: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Area (acres){harvestModal.maxArea !== undefined ? ` (max ${harvestModal.maxArea})` : ""}
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        value={harvestModal.area}
                        onChange={(e) => setHarvestModal((p) => ({ ...p, area: e.target.value }))}
                      />
                      <div className="small-muted mt-1">If blank, remaining area is used.</div>
                    </div>
                  </>
                )}
                {harvestModal.isFinal && (
                  <div className="mb-3">
                    <label className="form-label">Final Yield (quintals)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={harvestModal.finalYield}
                      onChange={(e) => setHarvestModal((p) => ({ ...p, finalYield: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeHarvestModal}>Cancel</button>
                <button className="btn btn-success" onClick={submitHarvest}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- HISTORY MODAL ---------- */}
      {historyModal.open && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.28)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Harvest History - {historyModal.cropName}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeHistory}></button>
              </div>
              <div className="modal-body">
                {historyModal.events.length === 0 ? (
                  <div className="text-muted">No harvest events yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Qty (kg)</th>
                          <th>Area (acres)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyModal.events.map((h) => (
                          <tr key={h.id}>
                            <td>{h.harvested_on ? h.harvested_on.slice(0, 10) : "-"}</td>
                            <td>{h.harvested_qty ?? "-"}</td>
                            <td>{h.harvested_area_acres ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeHistory}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
