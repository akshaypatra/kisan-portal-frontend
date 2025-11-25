// FarmersProfileEditForm.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCamera, FaSave,FaUndo } from "react-icons/fa";

/**
 * FarmersProfileEditForm.jsx
 *
 * - Reads initial farmer object from location.state.farmer
 * - Expects location.state.canEditPhone (boolean) — when false phone input is disabled
 * - Replace handleSave() with API call to persist changes
 *
 * Usage: mount at /edit-profile route
 */

export default function FarmersProfileEditForm() {
  const nav = useNavigate();
  const location = useLocation();
  const incoming = (location && location.state && location.state.farmer) || null;
  const canEditPhoneFromState = !!(location && location.state && location.state.canEditPhone);

  // fallback sample data if none provided
  const sample = {
    id: 1001,
    fullName: "Ramesh Kumar",
    phone: "+91-98765-43210",
    photoUrl: "", // optional
    age: 45,
    aadhaar: "123412341234",
    kcc: {
      number: "KCC-AP-2025-000123",
      bank: "State Cooperative Bank",
      branch: "Block Branch, Nandgaon",
      limit: "₹150,000",
      issuedOn: "2023-11-10",
      validUpto: "2028-11-09",
    },
    address: {
      line1: "House No. 12, Near Primary School",
      line2: "Village: Nandgaon, Taluka: Shirur",
      district: "Pune",
      state: "Maharashtra",
      pin: "412105",
    },
    farmDetails: {
      totalAreaHa: 3.2,
      ownedAreaHa: 2.0,
      leasedAreaHa: 1.2,
      mainCrops: ["Wheat", "Mustard"],
    },
    notes: "Member of farmer producer group since 2021.",
  };

  // form state (deep copy)
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(incoming || sample)));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(incoming?.photoUrl || sample.photoUrl || "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ensure form resets when location changes
  useEffect(() => {
    setForm(JSON.parse(JSON.stringify(incoming || sample)));
    setPhotoFile(null);
    setPhotoPreview((incoming && incoming.photoUrl) || sample.photoUrl || "");
    setErrors({});
     // eslint-disable-next-line
  }, [incoming]);

  // handle simple fields
  function setField(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!cur[p]) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }

  // file change
  function handlePhotoChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrors((s) => ({ ...s, photo: "Please choose a valid image file." }));
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    setErrors((s) => ({ ...s, photo: null }));
  }

  // simple validation
  function validate() {
    const err = {};
    if (!form.fullName || form.fullName.trim().length < 2) err.fullName = "Enter full name (2+ characters).";
    if (form.age !== undefined && (Number.isNaN(Number(form.age)) || Number(form.age) <= 0)) err.age = "Enter a valid age.";
    const aad = String(form.aadhaar || "").replace(/\s+/g, "");
    if (aad && !/^\d{12}$/.test(aad)) err.aadhaar = "Aadhaar must be 12 digits.";
    const pin = String(form.address?.pin || "");
    if (pin && !/^\d{6}$/.test(pin)) err["address.pin"] = "PIN code must be 6 digits.";
    // KCC number optional, but if present ensure length > 5
    if (form.kcc && form.kcc.number && String(form.kcc.number).trim().length < 5) err["kcc.number"] = "KCC number looks too short.";
    return err;
  }

  async function handleSave(e) {
    e && e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);

      // --- Replace this block with your API call ---
      // Example structure to send to backend:
      const payload = { ...form };
      if (photoFile) {
        // You would normally create FormData and append file + payload
        // const fd = new FormData();
        // fd.append('photo', photoFile);
        // fd.append('payload', JSON.stringify(payload));
        // await api.post('/user/update-profile', fd, { headers: {'Content-Type': 'multipart/form-data'} })
        // For demo, we'll simulate a small delay
      }
      await new Promise((r) => setTimeout(r, 700));
      // --- End replace ---

      // For now show success and navigate back with updated data
      alert("Profile saved (local demo). Replace handleSave with API call to persist.");
      nav("/profile", { state: { updated: true, farmer: payload } });
    } catch (err) {
      console.error(err);
      alert("Failed to save — try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(JSON.parse(JSON.stringify(incoming || sample)));
    setPhotoFile(null);
    setPhotoPreview((incoming && incoming.photoUrl) || sample.photoUrl || "");
    setErrors({});
  }

  return (
    <div className="container py-4">
      <style>{`
        :root {
          --accent-green: #6fb86f;
          --muted: #6c757d;
        }
        .edit-card { border-radius:12px; box-shadow: 0 12px 28px rgba(10,40,20,0.05); padding:16px; background: #fff; }
        .avatar-preview { width:120px; height:120px; border-radius:10px; object-fit:cover; border:1px solid rgba(0,0,0,0.04); background:#f6fbf9; display:block; }
        .label-small { font-size:13px; color:var(--muted); }
        .error { color:#d9534f; font-size:13px; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Edit Profile</h3>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => nav(-1)}>
            Cancel
          </button>
        </div>
      </div>

      <form className="edit-card" onSubmit={handleSave}>
        <div className="row g-3">
          {/* Photo & name */}
          <div className="col-12 col-md-4 text-center">
            <div>
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="avatar-preview mb-2" />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: 10, background: "#f2fbf4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#25632a", marginBottom: 8 }}>
                  {form.fullName ? (form.fullName.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase()) : "F"}
                </div>
              )}
            </div>

            <div className="mb-2">
              <label className="btn btn-sm btn-outline-primary">
                <FaCamera style={{ marginRight: 6 }} /> Choose photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </label>
            </div>
            {errors.photo && <div className="error">{errors.photo}</div>}
          </div>

          <div className="col-12 col-md-8">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-label">Full name</label>
                <input className="form-control" value={form.fullName || ""} onChange={(e) => setField("fullName", e.target.value)} />
                {errors.fullName && <div className="error">{errors.fullName}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Phone (can't change)</label>
                <input className="form-control" value={form.phone || ""} disabled={!canEditPhoneFromState} onChange={(e) => setField("phone", e.target.value)} />
                {!canEditPhoneFromState && <div className="label-small">Phone is linked to account — contact support to change it.</div>}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Age</label>
                <input type="number" min="0" className="form-control" value={form.age || ""} onChange={(e) => setField("age", e.target.value)} />
                {errors.age && <div className="error">{errors.age}</div>}
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label">Aadhaar number</label>
                <input className="form-control" value={form.aadhaar || ""} onChange={(e) => setField("aadhaar", e.target.value.replace(/\D/g, ""))} placeholder="12 digits" />
                {errors.aadhaar && <div className="error">{errors.aadhaar}</div>}
                <div className="label-small mt-1">Aadhaar is private — we mask it in public views.</div>
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label">Home address</label>
                <input className="form-control mb-2" placeholder="Address line 1" value={form.address?.line1 || ""} onChange={(e) => setField("address.line1", e.target.value)} />
                <input className="form-control mb-2" placeholder="Address line 2 (village, locality)" value={form.address?.line2 || ""} onChange={(e) => setField("address.line2", e.target.value)} />
                <div className="row g-2">
                  <div className="col-6">
                    <input className="form-control" placeholder="District" value={form.address?.district || ""} onChange={(e) => setField("address.district", e.target.value)} />
                  </div>
                  <div className="col-4">
                    <input className="form-control" placeholder="State" value={form.address?.state || ""} onChange={(e) => setField("address.state", e.target.value)} />
                  </div>
                  <div className="col-2">
                    <input className="form-control" placeholder="PIN" value={form.address?.pin || ""} onChange={(e) => setField("address.pin", e.target.value.replace(/\D/g, ""))} />
                    {errors["address.pin"] && <div className="error">{errors["address.pin"]}</div>}
                  </div>
                </div>
              </div>

              {/* Farm details */}
              <div className="col-12 col-md-4">
                <label className="form-label">Total area (ha)</label>
                <input type="number" step="0.01" className="form-control" value={form.farmDetails?.totalAreaHa ?? ""} onChange={(e) => setField("farmDetails.totalAreaHa", e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Owned area (ha)</label>
                <input type="number" step="0.01" className="form-control" value={form.farmDetails?.ownedAreaHa ?? ""} onChange={(e) => setField("farmDetails.ownedAreaHa", e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Leased area (ha)</label>
                <input type="number" step="0.01" className="form-control" value={form.farmDetails?.leasedAreaHa ?? ""} onChange={(e) => setField("farmDetails.leasedAreaHa", e.target.value)} />
              </div>

              <div className="col-12">
                <label className="form-label">Main crops (comma separated)</label>
                <input className="form-control" value={(form.farmDetails?.mainCrops || []).join(", ")} onChange={(e) => setField("farmDetails.mainCrops", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
              </div>

              {/* KCC */}
              <div className="col-12 col-md-6">
                <label className="form-label">KCC number</label>
                <input className="form-control" value={form.kcc?.number || ""} onChange={(e) => setField("kcc.number", e.target.value)} />
                {errors["kcc.number"] && <div className="error">{errors["kcc.number"]}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">KCC limit (display)</label>
                <input className="form-control" value={form.kcc?.limit || ""} onChange={(e) => setField("kcc.limit", e.target.value)} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Issuing bank</label>
                <input className="form-control" value={form.kcc?.bank || ""} onChange={(e) => setField("kcc.bank", e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Branch</label>
                <input className="form-control" value={form.kcc?.branch || ""} onChange={(e) => setField("kcc.branch", e.target.value)} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Issued on</label>
                <input type="date" className="form-control" value={form.kcc?.issuedOn || ""} onChange={(e) => setField("kcc.issuedOn", e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Valid up to</label>
                <input type="date" className="form-control" value={form.kcc?.validUpto || ""} onChange={(e) => setField("kcc.validUpto", e.target.value)} />
              </div>

              <div className="col-12">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows={3} value={form.notes || ""} onChange={(e) => setField("notes", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}><FaUndo style={{ marginRight: 8 }} /> Reset</button>
            <button type="submit" className="btn btn-success" disabled={saving}><FaSave style={{ marginRight: 8 }} /> {saving ? "Saving..." : "Save changes"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
