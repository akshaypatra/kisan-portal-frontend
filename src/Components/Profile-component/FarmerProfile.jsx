// FarmerProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaPhoneAlt,
  FaSeedling,
  FaUniversity,
} from "react-icons/fa";

/**
 * FarmerProfile.jsx — Farmer-friendly, colorful, readable UI
 *
 * Usage:
 * <FarmerProfile /> or <FarmerProfile farmer={yourFarmer} />
 *
 * Edit button navigates to /edit-profile with state { farmer, canEditPhone: false }
 */

export default function FarmerProfile({ farmer: initialFarmer }) {
  const navigate = useNavigate();

  // sample data (replace with real data / props)
  const sampleFarmer = {
    id: 1001,
    fullName: "Ramesh Kumar",
    phone: "+91-98765-43210",
    photoUrl: "",
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

  const farmer = initialFarmer || sampleFarmer;
  const [showAadhaar, setShowAadhaar] = useState(false);

  function maskAadhaar(aadhaar) {
    if (!aadhaar) return "—";
    const s = String(aadhaar).replace(/\s+/g, "");
    if (s.length < 12) return s;
    return `${s.slice(0, 4)} **** ${s.slice(-4)}`;
  }
  function unmaskAadhaar(aadhaar) {
    if (!aadhaar) return "—";
    const s = String(aadhaar).replace(/\s+/g, "");
    if (s.length < 12) return s;
    return `${s.slice(0, 4)} ${s.slice(4, 8)} ${s.slice(8, 12)}`;
  }

  function handleEdit() {
    navigate("/edit-profile", { state: { farmer, canEditPhone: false } });
  }

  const hasPhoto = !!farmer.photoUrl;
  const initials = (farmer.fullName || "F")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="container py-4">
      <style>{`
        :root{
          --accent-green: #6fb86f;
          --soft-green: #f2fbf4;
          --soft-cream: #fff9f2;
          --muted: #6c757d;
          --card-shadow: 0 12px 30px rgba(20,60,30,0.06);
        }
        .profile-wrapper { border-radius:14px; box-shadow: var(--card-shadow); background: linear-gradient(180deg,#ffffff,#fbfff6); padding:18px; }
        .avatar { width:140px; height:140px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:36px; color: #25632a; background: var(--soft-green); border: 1px solid rgba(0,0,0,0.04); }
        .name { font-size:20px; font-weight:900; color:#184a2a; }
        .subtitle { color:var(--muted); font-size:14px; }
        .section { border-radius:10px; padding:12px; background: #fff; border: 1px solid rgba(10,30,10,0.02); }
        .section-title { font-weight:800; color:#26532d; margin-bottom:8px; }
        .info-label { color:var(--muted); font-size:13px; }
        .info-value { font-weight:800; font-size:16px; }
        .kcc-pill { padding:6px 10px; border-radius:999px; background:var(--soft-cream); color: #a05b0a; font-weight:800; }
        .badge-crop { background:#eef9f0; color: #2f7a3a; font-weight:700; padding:6px 10px; border-radius:999px; margin-right:6px; }
        .action-row { display:flex; gap:10px; align-items:center; }
        .big-btn { padding:10px 14px; font-weight:700; }
        .muted { color:var(--muted); }
        @media (max-width:767px) {
          .avatar { width:110px; height:110px; font-size:28px; }
          .name { font-size:18px; }
        }
      `}</style>

      <div className="profile-wrapper">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#f1fcf3", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-green)", fontWeight: 800 }}>
                <FaSeedling />
              </div>
              <div>
                <div className="name">Your Profile</div>
                <div className="subtitle">Quick view of your personal information</div>
              </div>
            </div>
          </div>

          <div className="action-row">
            <button className="btn btn-outline-secondary big-btn" onClick={() => navigate("/dashboard")}>Back</button>
          </div>
        </div>

        <div className="row g-3">
          {/* Left: avatar & quick stats */}
          <div className="col-12 col-md-4">
            <div className="section text-center">
              {hasPhoto ? (
                <img
                  src={farmer.photoUrl}
                  alt={farmer.fullName}
                  style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(0,0,0,0.04)" }}
                />
              ) : (
                <div className="avatar mb-2" aria-hidden>
                  {initials}
                </div>
              )}

              <div style={{ marginTop: 6 }}>
                <div className="name">{farmer.fullName}</div>
                <div className="subtitle">{farmer.age ? `${farmer.age} years` : "Age not set"}</div>
              </div>

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="info-label">Total land</div>
                  <div className="info-value">{farmer.farmDetails?.totalAreaHa ?? "—"} ha</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="info-label">Owned</div>
                  <div className="info-value">{farmer.farmDetails?.ownedAreaHa ?? "—"} ha</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="info-label">Leased</div>
                  <div className="info-value">{farmer.farmDetails?.leasedAreaHa ?? "—"} ha</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="info-label mb-1">Main crops</div>
                <div>
                  {(farmer.farmDetails?.mainCrops || []).length > 0 ? (
                    (farmer.farmDetails.mainCrops || []).map((c) => (
                      <span key={c} className="badge-crop" style={{ marginBottom: 6 }}>
                        {c}
                      </span>
                    ))
                  ) : (
                    <div className="muted">No crops listed</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className="col-12 col-md-8">
            <div className="section">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="section-title">Personal & contact</div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div className="info-label">Phone</div>
                  <div className="info-value">
                    <FaPhoneAlt style={{ marginRight: 8, color: "var(--accent-green)" }} />
                    {farmer.phone}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>Phone is linked to your account and cannot be changed here.</div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="info-label">Region</div>
                  <div className="info-value">
                    <FaMapMarkerAlt style={{ marginRight: 8, color: "var(--accent-green)" }} />
                    {farmer.address?.district ?? "—"}, {farmer.address?.state ?? "—"}
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="info-label d-flex align-items-center">
                    <FaIdCard style={{ marginRight: 8, color: "#4b6b4b" }} /> Aadhaar
                    <small className="muted" style={{ marginLeft: 8, fontSize: 13 }}>(private)</small>
                  </div>
                  <div className="info-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div>{showAadhaar ? unmaskAadhaar(farmer.aadhaar) : maskAadhaar(farmer.aadhaar)}</div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowAadhaar((s) => !s)}
                      aria-label={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
                      title={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
                    >
                      {showAadhaar ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="info-label">Address</div>
                  <div style={{ fontWeight: 800 }}>{farmer.address?.line1 ?? "—"}</div>
                  <div className="muted">
                    {farmer.address?.line2 ? `${farmer.address.line2}, ` : ""}
                    {farmer.address?.district ?? ""} — {farmer.address?.pin ?? ""} <br />
                    {farmer.address?.state ?? ""}
                  </div>
                </div>
              </div>
            </div>

            {/* KCC Section */}
            <div className="section mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="section-title">Kisan Credit Card (KCC)</div>
                  <div className="muted" style={{ fontSize: 13 }}>Short-term farm loan details from the bank</div>
                </div>
                <div>
                  <span className="kcc-pill">Limit: {farmer.kcc?.limit ?? "—"}</span>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <div className="info-label">KCC Number</div>
                  <div className="info-value">{farmer.kcc?.number ?? "—"}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="info-label">Bank / Branch</div>
                  <div className="info-value">
                    <FaUniversity style={{ marginRight: 8, color: "#9a6a00" }} />
                    {farmer.kcc?.bank ?? "—"} {farmer.kcc?.branch ? ` · ${farmer.kcc.branch}` : ""}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="info-label">Issued on</div>
                  <div className="info-value">{farmer.kcc?.issuedOn ?? "—"}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="info-label">Valid up to</div>
                  <div className="info-value">{farmer.kcc?.validUpto ?? "—"}</div>
                </div>
              </div>
            </div>

            {/* Notes & actions */}
            <div className="section mt-3 d-flex flex-column">
              <div>
                <div className="section-title">Notes</div>
                <div className="muted">{farmer.notes ?? "No notes available."}</div>
              </div>

              <div className="d-flex justify-content-end mt-3 gap-2">
                <button className="btn btn-outline-secondary" onClick={() => alert("Contact support flow (implement)")}>Contact support</button>
                <button className="btn" onClick={handleEdit} style={{ background: "linear-gradient(90deg,#65b86a,#8bd18b)", color: "#fff", border: "none", fontWeight: 800 }}>
                  <FaEdit style={{ marginRight: 8 }} /> Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> {/* profile-wrapper */}
    </div>
  );
}
