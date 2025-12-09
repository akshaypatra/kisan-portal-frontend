import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

/**
 * CropsPage.jsx (images removed, extended crop list)
 * - No external images (uses placeholder tile with crop initials)
 * - Larger dataset: cereals, pulses, oilseeds, vegetables, fruits, flowers, spices, beverages
 * - Search + details modal preserved
 *
 * Keep Bootstrap CSS available in the app for styling.
 */

export default function CropsPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  // ---------- Extended crop data (no images) ----------
  const crops = useMemo(
    () => [
  {
    "id": "mustard",
    "name": "Mustard / Rapeseed",
    "category": "Oilseed",
    "season": "Rabi",
    "sowMonths": "Oct - Nov",
    "harvestMonths": "Feb - Apr",
    "majorStates": ["Rajasthan", "Haryana", "Uttar Pradesh"],
    "avgYield": "≈ 1.0 - 2.0 t/ha",
    "uses": "Edible oil, meal for animals",
    "more": "Important edible oilseed for northern India; widely grown in Indo-Gangetic plains as a key rabi oilseed.",
    "sourceLabel": "MOSPI / PIB",
    "sourceCitations": []
  },
  {
    "id": "soybean",
    "name": "Soybean",
    "category": "Oilseed",
    "season": "Kharif",
    "sowMonths": "Jun - Jul",
    "harvestMonths": "Oct - Nov",
    "majorStates": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Gujarat"],
    "avgYield": "≈ 1.0 - 2.5 t/ha",
    "uses": "Oil, protein meal, livestock feed",
    "more": "Key kharif oilseed for central India; used for edible oil, protein meal and in crop rotations with cereals and pulses.",
    "sourceLabel": "MOSPI",
    "sourceCitations": []
  },
  {
    "id": "groundnut",
    "name": "Groundnut (Peanut)",
    "category": "Oilseed",
    "season": "Kharif (main) + some Rabi/Summer",
    "sowMonths": "Jun - Jul (Kharif); Oct - Nov / Jan - Feb (Rabi & Summer, region-specific)",
    "harvestMonths": "Oct - Nov (Kharif); Feb - Apr / May - Jun",
    "majorStates": ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Karnataka", "Rajasthan", "Maharashtra"],
    "avgYield": "≈ 1.0 - 2.0 t/ha (pods, varies by season & region)",
    "uses": "Edible oil, roasted nuts, confectionery, peanut butter, oilcake for livestock feed",
    "more": "About 90% of India's groundnut area and production is under Kharif crop; a major rainfed oilseed of western and southern India and important in crop rotations.",
    "sourceLabel": "NABARD / ICAR / DAC&FW",
    "sourceCitations": []
  },
  {
    "id": "sunflower",
    "name": "Sunflower",
    "category": "Oilseed",
    "season": "Kharif & Rabi (also Spring in some areas)",
    "sowMonths": "Jun - Aug (Kharif); Sep - Nov (Rabi); Jan - Feb (Spring in non-traditional areas)",
    "harvestMonths": "Oct - Jan / Feb - Apr (depending on sowing window)",
    "majorStates": ["Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Haryana", "Tamil Nadu", "Bihar"],
    "avgYield": "≈ 1.0 - 2.0 t/ha",
    "uses": "Refined edible oil, bakery and snack industry, oilcake for feed",
    "more": "A short-duration oilseed with flexible sowing windows; grown as an irrigated as well as rainfed crop and used to diversify oilseed basket beyond groundnut and mustard.",
    "sourceLabel": "ICAR-IIOR / State Agriculture Universities",
    "sourceCitations": []
  },
  {
    "id": "sesame",
    "name": "Sesame (Til)",
    "category": "Oilseed",
    "season": "Kharif & Rabi (with some Summer crops)",
    "sowMonths": "Jun - Jul (Kharif); Oct - Nov (Rabi); Jan - Mar (Summer/coastal belts, state-specific)",
    "harvestMonths": "Sep - Oct (Kharif); Feb - Apr (Rabi & Summer)",
    "majorStates": ["West Bengal", "Gujarat", "Rajasthan", "Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Maharashtra"],
    "avgYield": "≈ 0.4 - 0.8 t/ha",
    "uses": "High-value edible oil, sweets and bakery, tahini, oilcake, medicinal and traditional uses",
    "more": "A small-seeded but high-oil crop; grown across most states with significant area in eastern and western India and important for niche export markets.",
    "sourceLabel": "ICAR-IIOR / Tractorkarvan / Vikaspedia",
    "sourceCitations": []
  },
  {
    "id": "safflower",
    "name": "Safflower (Kardi)",
    "category": "Oilseed",
    "season": "Rabi",
    "sowMonths": "Late Oct - Nov",
    "harvestMonths": "Feb - Apr",
    "majorStates": ["Maharashtra", "Karnataka", "Telangana", "Andhra Pradesh", "Madhya Pradesh", "Chhattisgarh", "Uttar Pradesh", "Bihar", "Odisha"],
    "avgYield": "≈ 0.5 - 1.2 t/ha",
    "uses": "Edible oil (traditional and high-linoleic types), bird feed, petals for natural dyes",
    "more": "An important rabi oilseed of dryland areas; cultivation is concentrated mainly in Maharashtra and Karnataka which contribute the bulk of national production.",
    "sourceLabel": "ICAR-IIOR / ApniKheti / Research studies",
    "sourceCitations": []
  },
  {
    "id": "niger",
    "name": "Niger Seed",
    "category": "Oilseed",
    "season": "Kharif (rainfed, sometimes extended into late season)",
    "sowMonths": "Jun - Sep (from onset of monsoon, region-specific)",
    "harvestMonths": "Oct - Jan (depending on sowing time & region)",
    "majorStates": ["Odisha", "Madhya Pradesh", "Andhra Pradesh", "Chhattisgarh", "Maharashtra", "Karnataka", "Jharkhand", "Gujarat", "Bihar", "West Bengal", "Assam"],
    "avgYield": "≈ 0.3 - 1.0 t/ha (under good management up to ≈ 0.8 - 1.0 t/ha)",
    "uses": "Edible oil (often in tribal and local diets), bird feed, niche export markets",
    "more": "A hardy minor oilseed suited to poor, sloping and rainfed lands; low input requirements make it important in tribal and hilly areas, especially in eastern and central India.",
    "sourceLabel": "ICAR-IIOR / DAC&FW",
    "sourceCitations": []
  },
  {
    "id": "castor",
    "name": "Castor Seed",
    "category": "Oilseed",
    "season": "Kharif (main), some Rabi/Summer",
    "sowMonths": "Jul - Aug (Kharif, with onset of monsoon); Sep - Oct (late / Rabi sowing in some regions)",
    "harvestMonths": "Dec - Apr (multiple pickings over 4–7 months)",
    "majorStates": ["Gujarat", "Rajasthan", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Odisha", "Jharkhand"],
    "avgYield": "≈ 1.0 - 2.5 t/ha (seed, depending on hybrid, inputs & climate)",
    "uses": "Industrial castor oil (lubricants, polymers, pharmaceuticals, cosmetics), biodiesel, dehydrated castor oil derivatives",
    "more": "India is the world leader in castor seed and oil production with Gujarat as the dominant state; castor is primarily an industrial oilseed with high export orientation.",
    "sourceLabel": "ICAR-IIOR / Commodity Boards / Market studies",
    "sourceCitations": []
  },
  {
    "id": "linseed",
    "name": "Linseed (Flaxseed)",
    "category": "Oilseed",
    "season": "Rabi",
    "sowMonths": "Oct - Nov (first fortnight of October to mid-November)",
    "harvestMonths": "Feb - Mar",
    "majorStates": ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "Chhattisgarh", "Maharashtra", "Himachal Pradesh", "Jharkhand", "Rajasthan"],
    "avgYield": "≈ 0.5 - 0.8 t/ha",
    "uses": "Edible and industrial oil (rich in omega-3), linseed oil for paints and varnishes, oilcake for feed, whole seed as functional food",
    "more": "A cool-season rabi oilseed; grown mainly in central and eastern states. Linseed oil has both food and industrial uses, and flaxseed is gaining popularity as a health food.",
    "sourceLabel": "Vikaspedia / ICAR / Recent linseed studies",
    "sourceCitations": []
  },
]
,
    []
  );

  // ---------- helpers ----------
  const filtered = crops.filter((c) => {
    const ql = q.trim().toLowerCase();
    if (!ql) return true;
    return (
      c.name.toLowerCase().includes(ql) ||
      (c.category || "").toLowerCase().includes(ql) ||
      (c.majorStates || []).join(" ").toLowerCase().includes(ql) ||
      (c.more || "").toLowerCase().includes(ql)
    );
  });

  function PlaceholderTile({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const colors = ["#E9F6EC", "#FFF4E6", "#F6F6FF", "#FFF0F0", "#F0FBFF"];
  const bg = colors[name.length % colors.length];
  const fg = "#2b7a36";
  return (
    <div
      style={{
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        borderBottom: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          color: fg,
          boxShadow: "0 6px 16px rgba(10,30,10,0.04)",
        }}
      >
        {initials}
      </div>
    </div>
  );
}

function CropImage({ crop }) {
  const [error, setError] = useState(false);

  if (error) {
    // fallback if image not found
    return <PlaceholderTile name={crop.name} />;
  }

  return (
    <div
      style={{
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#E9F6EC",
        borderBottom: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      <img
        src={`/IMAGES/crops/${crop.id}.png`}   // ⬅️ important: no "public" in path
        alt={crop.name}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "cover",
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}


  return (
    <div className="container py-4">
      <style>{`
        .crop-card { border-radius: 12px; box-shadow: 0 8px 24px rgba(15,40,20,0.05); overflow: hidden; border: 1px solid rgba(10,30,10,0.03); }
        .chip { padding: 6px 10px; border-radius: 999px; font-weight:700; font-size:13px; }
        .search-row { gap: 12px; display:flex; align-items:center; margin-bottom: 16px; flex-wrap:wrap; }
        @media (max-width: 576px) {
          .search-row { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 style={{ margin: 0 }}>Oil Seeds of India — Details</h3>
        </div>
      </div>

      {/* Search */}
      <div className="search-row mb-3">
        <div className="input-group" style={{ flex: 1 }}>
          <span className="input-group-text bg-white"><FaSearch /></span>
          <input
            className="form-control"
            placeholder="Search crops, category, state, or notes (e.g. wheat, fruit, Maharashtra)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div>
          <button className="btn btn-outline-secondary" onClick={() => setQ("")}>Clear</button>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {filtered.map((c) => (
          <div key={c.id} className="col-12 col-md-6 col-lg-4">
            <div className="crop-card card h-100">
              <CropImage crop={c} />

              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 style={{ marginBottom: 6 }}>{c.name}</h5>
                    <div className="text-muted" style={{ fontSize: 13 }}>{c.category}</div>
                  </div>
                  <div>
                    <span className="chip" style={{ background: "#e9f6ec", color: "#2b7a36" }}>{c.season}</span>
                  </div>
                </div>

                <p style={{ marginTop: 10, marginBottom: 8, flex: "0 0 auto" }}>
                  <strong>Major states:</strong> {c.majorStates.join(", ")}.
                </p>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.avgYield}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>Typical yield (approx.)</div>
                  </div>

                  <div>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(c)}>View details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-12">
            <div className="p-4 text-center text-muted">No crops match your search.</div>
          </div>
        )}
      </div>

      {/* ---------- DETAILS MODAL ---------- */}
      {selected && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selected.name} — Details</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setSelected(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <CropImage crop={selected} />

                  </div>

                  <div className="col-md-6">
                    <h6 className="mb-1">{selected.name}</h6>
                    <div className="text-muted mb-2">{selected.category} • {selected.season}</div>

                    <div className="mb-2"><strong>Sowing:</strong> {selected.sowMonths}</div>
                    <div className="mb-2"><strong>Harvest:</strong> {selected.harvestMonths}</div>
                    <div className="mb-2"><strong>Major producing states:</strong> {selected.majorStates.join(", ")}</div>
                    <div className="mb-2"><strong>Average yield (indicative):</strong> {selected.avgYield}</div>

                    <div className="mb-2"><strong>Uses:</strong> {selected.uses}</div>

                    <div style={{ marginTop: 8 }}><strong>Notes:</strong> <div className="text-muted">{selected.more}</div></div>
                  </div>

                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Source: {selected.sourceLabel || "Various agri sources"}</small>
                        <div style={{ fontSize: 12 }} className="text-muted">{(selected.sourceCitations || []).join(" ")}</div>
                      </div>

                      <div>
                        <button className="btn btn-secondary me-2" onClick={() => setSelected(null)}>Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
