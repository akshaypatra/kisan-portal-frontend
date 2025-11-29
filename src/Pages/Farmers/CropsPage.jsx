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
      // Cereals
      {
        id: "rice",
        name: "Rice",
        category: "Cereal",
        season: "Kharif (main), some Rabi/Zaid",
        sowMonths: "June - July",
        harvestMonths: "Oct - Dec",
        majorStates: ["West Bengal", "Punjab", "Uttar Pradesh", "Chhattisgarh", "Odisha"],
        avgYield: "≈ 2.4 - 4.0 t/ha",
        uses: "Staple food, processed rice, rice bran oil, animal feed",
        more: "India is a top rice producer; many varieties cultivated across regions.",
        sourceLabel: "PIB / MOSPI",
        sourceCitations: [],
      },
      {
        id: "wheat",
        name: "Wheat",
        category: "Cereal",
        season: "Rabi",
        sowMonths: "Oct - Dec",
        harvestMonths: "Mar - May",
        majorStates: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh"],
        avgYield: "≈ 3.0 - 4.5 t/ha",
        uses: "Staple flour (atta), feed, industrial uses",
        more: "Wheat is the major rabi cereal and central to India's food security.",
        sourceLabel: "PIB / MOSPI",
        sourceCitations: [],
      },
      {
        id: "maize",
        name: "Maize",
        category: "Cereal",
        season: "Kharif / Zaid",
        sowMonths: "Jun - Jul / Feb - Mar",
        harvestMonths: "Sep - Oct / May - Jun",
        majorStates: ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana"],
        avgYield: "≈ 2.0 - 4.0 t/ha",
        uses: "Food, animal feed, starch, biofuel",
        more: "Maize is versatile — food, feed and industrial uses.",
        sourceLabel: "APEDA / MOSPI",
        sourceCitations: [],
      },
      {
        id: "sorghum",
        name: "Sorghum (Jowar)",
        category: "Cereal",
        season: "Kharif / Rabi",
        sowMonths: "Jun - Sep",
        harvestMonths: "Sep - Dec",
        majorStates: ["Maharashtra", "Karnataka", "Telangana", "Rajasthan"],
        avgYield: "≈ 1.0 - 2.5 t/ha",
        uses: "Staple in dryland areas, fodder, alcoholic beverages",
        more: "Drought-tolerant cereal widely grown in semi-arid regions.",
        sourceLabel: "MOSPI",
        sourceCitations: [],
      },

      // Pulses & Legumes
      {
        id: "pulses",
        name: "Pulses (Gram, Tur, Moong, Urad)",
        category: "Pulses / Legumes",
        season: "Rabi & Kharif",
        sowMonths: "Oct - Dec / Jun - Jul",
        harvestMonths: "Feb - Apr / Sep - Nov",
        majorStates: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Karnataka"],
        avgYield: "≈ 0.5 - 1.5 t/ha",
        uses: "Protein source for food, soil nitrogen fixation",
        more: "Critical for nutrition and crop rotation benefits.",
        sourceLabel: "MOSPI",
        sourceCitations: [],
      },

      // Oilseeds
      {
        id: "mustard",
        name: "Mustard / Rapeseed",
        category: "Oilseed",
        season: "Rabi",
        sowMonths: "Oct - Nov",
        harvestMonths: "Feb - Apr",
        majorStates: ["Rajasthan", "Haryana", "Uttar Pradesh"],
        avgYield: "≈ 1.0 - 2.0 t/ha",
        uses: "Edible oil, meal for animals",
        more: "Important edible oilseed for northern India.",
        sourceLabel: "MOSPI / PIB",
        sourceCitations: [],
      },
      {
        id: "soybean",
        name: "Soybean",
        category: "Oilseed",
        season: "Kharif",
        sowMonths: "Jun - Jul",
        harvestMonths: "Oct - Nov",
        majorStates: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Gujarat"],
        avgYield: "≈ 1.0 - 2.5 t/ha",
        uses: "Oil, protein meal, livestock feed",
        more: "Key oilseed for central India; also used in rotations.",
        sourceLabel: "MOSPI",
        sourceCitations: [],
      },

      // Cash / Commercial crops
      {
        id: "sugarcane",
        name: "Sugarcane",
        category: "Cash crop",
        season: "Perennial / long-duration",
        sowMonths: "Oct - Feb (varies)",
        harvestMonths: "Varies (harvest windows)",
        majorStates: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu"],
        avgYield: "High tonnage/ha",
        uses: "Sugar, jaggery, ethanol, molasses",
        more: "Industrial crop processed by sugar mills and jaggery units.",
        sourceLabel: "PIB",
        sourceCitations: [],
      },
      {
        id: "cotton",
        name: "Cotton",
        category: "Fiber crop",
        season: "Kharif",
        sowMonths: "Jun - Jul",
        harvestMonths: "Oct - Feb",
        majorStates: ["Gujarat", "Maharashtra", "Telangana", "Madhya Pradesh"],
        avgYield: "Varies (lint yield kg/ha)",
        uses: "Textile fiber, seed oil",
        more: "Major fiber crop supporting textiles and related industries.",
        sourceLabel: "MOSPI",
        sourceCitations: [],
      },

      // Vegetables
      {
        id: "tomato",
        name: "Tomato",
        category: "Vegetable",
        season: "Kharif / Rabi",
        sowMonths: "Sep - Nov or Feb - Apr",
        harvestMonths: "60–120 days after transplant",
        majorStates: ["Andhra Pradesh", "Karnataka", "Maharashtra", "Odisha"],
        avgYield: "Varies widely",
        uses: "Fresh market, processing, sauces, ketchup",
        more: "High-value vegetable with seasonal price variability.",
        sourceLabel: "Horticulture reports",
        sourceCitations: [],
      },
      {
        id: "potato",
        name: "Potato",
        category: "Vegetable",
        season: "Rabi / Kharif (in some regions)",
        sowMonths: "Oct - Dec / Feb - Mar (varies)",
        harvestMonths: "Feb - Apr / Jun - Jul",
        majorStates: ["Uttar Pradesh", "West Bengal", "Bihar", "Punjab"],
        avgYield: "≈ 20 - 30 t/ha (varies)",
        uses: "Staple vegetable, processing (chips, fries)",
        more: "Major cash & staple tuber crop across India.",
        sourceLabel: "Horticulture / MOSPI",
        sourceCitations: [],
      },
      {
        id: "onion",
        name: "Onion",
        category: "Vegetable",
        season: "Kharif / Rabi (depends on type)",
        sowMonths: "Aug - Nov / Jan - Feb",
        harvestMonths: "Dec - May (varies)",
        majorStates: ["Maharashtra", "Rajasthan", "Karnataka", "Gujarat"],
        avgYield: "Varies by variety",
        uses: "Culinary, processed dehydrated onion",
        more: "Onion production and prices are economically sensitive.",
        sourceLabel: "Horticulture reports",
        sourceCitations: [],
      },

      // Fruits
      {
        id: "banana",
        name: "Banana",
        category: "Fruit",
        season: "Year-round (tropical)",
        sowMonths: "Planting mostly year-round",
        harvestMonths: "Varies by planting",
        majorStates: ["Tamil Nadu", "Kerala", "Maharashtra", "Karnataka"],
        avgYield: "High bunch yield per ha",
        uses: "Fresh fruit, chips, processed products",
        more: "Important tropical fruit and income source for smallholders.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },
      {
        id: "mango",
        name: "Mango",
        category: "Fruit",
        season: "Summer (Kharif harvest)",
        sowMonths: "Feb - Jun (flowering/prep)",
        harvestMonths: "Mar - Jul",
        majorStates: ["Maharashtra", "Andhra Pradesh", "Uttar Pradesh", "Karnataka"],
        avgYield: "Varies widely by variety",
        uses: "Fresh fruit, pulp, processing (pickles, dried)",
        more: "King of fruits — many local varieties and export demand.",
        sourceLabel: "Horticulture / APEDA",
        sourceCitations: [],
      },
      {
        id: "apple",
        name: "Apple",
        category: "Fruit (temperate)",
        season: "Autumn harvest (temperate)",
        sowMonths: "Late winter / spring (planting in hills)",
        harvestMonths: "Aug - Oct (varies)",
        majorStates: ["Himachal Pradesh", "Jammu & Kashmir", "Uttarakhand"],
        avgYield: "Varies (temperate orchard yields)",
        uses: "Fresh fruit, processing, export",
        more: "Major temperate fruit in hill states with export potential.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },
      {
        id: "grape",
        name: "Grape",
        category: "Fruit",
        season: "Multiple varieties (table / wine)",
        sowMonths: "Planting varies",
        harvestMonths: "Aug - Mar (depending on variety)",
        majorStates: ["Maharashtra", "Karnataka", "Andhra Pradesh"],
        avgYield: "Varies",
        uses: "Fresh table grapes, raisins, wine",
        more: "Grapes are used both as table fruit and processed products.",
        sourceLabel: "Horticulture / APEDA",
        sourceCitations: [],
      },

      // Spices & Beverage
      {
        id: "tea",
        name: "Tea",
        category: "Beverage crop",
        season: "Year-round (plucking seasons vary)",
        sowMonths: "Planting in humid zones",
        harvestMonths: "Multiple flushes annually",
        majorStates: ["Assam", "West Bengal (Darjeeling)", "Tamil Nadu", "Kerala"],
        avgYield: "Varies by region & type",
        uses: "Beverage (black/green tea), export commodity",
        more: "Tea is a major export-earning horticulture crop for India.",
        sourceLabel: "Tea Board / APEDA",
        sourceCitations: [],
      },
      {
        id: "coffee",
        name: "Coffee",
        category: "Beverage crop",
        season: "Perennial (Arabica/Robusta)",
        sowMonths: "Planting in hills",
        harvestMonths: "Oct - Mar (varies)",
        majorStates: ["Karnataka", "Kerala", "Tamil Nadu"],
        avgYield: "Varies",
        uses: "Beverage (coffee beans), export",
        more: "Coffee is grown primarily in southern hill states.",
        sourceLabel: "Coffee Board",
        sourceCitations: [],
      },
      {
        id: "pepper",
        name: "Black Pepper",
        category: "Spice",
        season: "Perennial vine",
        sowMonths: "Planting in humid tropics",
        harvestMonths: "Varies",
        majorStates: ["Kerala", "Karnataka", "Tamil Nadu"],
        avgYield: "Varies (peppercorn yield)",
        uses: "Spice, export commodity",
        more: "Black pepper is a high-value spice grown in southern India.",
        sourceLabel: "Spice Board",
        sourceCitations: [],
      },

      // Flowers / Ornamental
      {
        id: "rose",
        name: "Rose",
        category: "Flower",
        season: "Year-round (in protected / irrigated areas)",
        sowMonths: "Planting year-round",
        harvestMonths: "Continuous (cut flower cycles)",
        majorStates: ["Karnataka", "Maharashtra", "Tamil Nadu"],
        avgYield: "Varies (cut flowers per plant)",
        uses: "Cut flowers, gardens, essential oils",
        more: "Cut-flower industry concentrated near metro supply chains.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },
      {
        id: "marigold",
        name: "Marigold",
        category: "Flower",
        season: "Kharif / Rabi (seasonal)",
        sowMonths: "Sep - Nov / Jan - Feb",
        harvestMonths: "45 - 90 days after sowing",
        majorStates: ["Maharashtra", "Karnataka", "Andhra Pradesh"],
        avgYield: "Varies (tonnage for marigold flowers)",
        uses: "Flower markets, garlands, dye, extraction",
        more: "Widely grown commercial flower for domestic markets and ceremonies.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },
      {
        id: "jasmine",
        name: "Jasmine",
        category: "Flower",
        season: "Perennial (many varieties)",
        sowMonths: "Planting varies",
        harvestMonths: "Continuous picking cycles",
        majorStates: ["Tamil Nadu", "Andhra Pradesh", "Maharashtra"],
        avgYield: "Varies",
        uses: "Perfume, garlands, essential oil",
        more: "Jasmine is an important fragrance and ceremonial flower.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },

      // Additional vegetables & niche crops
      {
        id: "chilli",
        name: "Chilli",
        category: "Spice / Vegetable",
        season: "Kharif / Rabi (varies)",
        sowMonths: "Jun - Aug / Oct - Dec",
        harvestMonths: "Varies",
        majorStates: ["Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra"],
        avgYield: "Varies",
        uses: "Culinary spice, processing, export",
        more: "High-value spice with strong export market for certain varieties.",
        sourceLabel: "Spice Board",
        sourceCitations: [],
      },
      {
        id: "garlic",
        name: "Garlic",
        category: "Vegetable / Spice",
        season: "Rabi",
        sowMonths: "Oct - Dec",
        harvestMonths: "Mar - May",
        majorStates: ["Maharashtra", "Madhya Pradesh", "Rajasthan"],
        avgYield: "Varies",
        uses: "Culinary, processed garlic products",
        more: "Garlic cultivation and price dynamics are regionally sensitive.",
        sourceLabel: "Horticulture",
        sourceCitations: [],
      },
    ],
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

  // small helper: placeholder tile with initials
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
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: bg, borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
        <div style={{ width: 80, height: 80, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: fg, boxShadow: "0 6px 16px rgba(10,30,10,0.04)" }}>
          {initials}
        </div>
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
          <h3 style={{ margin: 0 }}>Crops of India — Details</h3>
          <div className="text-muted">Extended list: cereals, pulses, oilseeds, vegetables, fruits, flowers, spices & beverage crops.</div>
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
              <PlaceholderTile name={c.name} />
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
                    <PlaceholderTile name={selected.name} />
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
