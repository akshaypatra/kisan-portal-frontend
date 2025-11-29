import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFilter,
  FaStore,
  FaDownload,
  FaTimes,
} from "react-icons/fa";

/**
 * MarketPage.jsx (with Details modal)
 *
 * - Adds a Details modal that opens when the "Details" button is clicked for a vendor
 * - Modal shows all vendor parameters and vendor-specific metrics:
 *   - vendor share (%) of visible demand
 *   - small pie (vendor vs others)
 *   - small trend chart (mock per-month demand)
 *
 * Required: bootstrap css + recharts + react-icons
 */

export default function MarketPage() {
  // ---------- sample vendors ----------
  const sampleVendors = useMemo(
    () => [
      {
        id: 1,
        vendorName: "Shri Ram Traders",
        crop: "Wheat",
        location: "Bharuch, Gujarat",
        quantity_t: 12,
        grade: "FAQ",
        contact: "+91-98765-43210",
        required_by: "2025-12-05",
        price_range: "₹1800-2100",
      },
      {
        id: 2,
        vendorName: "GreenField Exports",
        crop: "Maize",
        location: "Ahmedabad, Gujarat",
        quantity_t: 8,
        grade: "A",
        contact: "+91-91234-56789",
        required_by: "2025-11-30",
        price_range: "₹1500-1600",
      },
      {
        id: 3,
        vendorName: "Village Co-op",
        crop: "Tomato",
        location: "Pune, Maharashtra",
        quantity_t: 5,
        grade: "Local",
        contact: "+91-99887-77665",
        required_by: "2025-11-28",
        price_range: "₹4000-4500",
      },
      {
        id: 4,
        vendorName: "AgroMart",
        crop: "Wheat",
        location: "Surat, Gujarat",
        quantity_t: 20,
        grade: "FAQ",
        contact: "+91-90123-45678",
        required_by: "2025-12-10",
        price_range: "₹1750-1950",
      },
      {
        id: 5,
        vendorName: "UrbanFoods",
        crop: "Tomato",
        location: "Mumbai, Maharashtra",
        quantity_t: 7,
        grade: "A",
        contact: "+91-92345-67890",
        required_by: "2025-11-26",
        price_range: "₹4200-4700",
      },
      {
        id: 6,
        vendorName: "Harvest Hub",
        crop: "Mustard",
        location: "Akola, Maharashtra",
        quantity_t: 3,
        grade: "Special",
        contact: "+91-93456-78901",
        required_by: "2025-12-02",
        price_range: "₹4800-5200",
      },
      {
        id: 7,
        vendorName: "Rural Connect",
        crop: "Maize",
        location: "Nashik, Maharashtra",
        quantity_t: 4,
        grade: "B",
        contact: "+91-94567-89012",
        required_by: "2025-12-03",
        price_range: "₹1480-1550",
      },
    ],
    []
  );

  // ---------- state ----------
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cropFilter, setCropFilter] = useState("All");
  const [search, setSearch] = useState("");

  // details modal state
  const [selectedVendor, setSelectedVendor] = useState(null); // vendor object or null
  const [detailsOpen, setDetailsOpen] = useState(false);

  // init
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setVendors(sampleVendors);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [sampleVendors]);

  // derived crop list
  const cropList = useMemo(() => ["All", ...Array.from(new Set(sampleVendors.map((v) => v.crop)))], [sampleVendors]);

  // filtered vendors
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      const cropMatch = cropFilter === "All" || v.crop === cropFilter;
      const searchMatch =
        q === "" ||
        v.vendorName.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.crop.toLowerCase().includes(q) ||
        (v.contact || "").includes(q);
      return cropMatch && searchMatch;
    });
  }, [vendors, cropFilter, search]);

  // analytics from filtered
  const analytics = useMemo(() => {
    const totalDemand = filtered.reduce((s, v) => s + (v.quantity_t || 0), 0);
    const uniqueCrops = new Set(filtered.map((v) => v.crop)).size;
    const perCrop = {};
    filtered.forEach((v) => {
      perCrop[v.crop] = (perCrop[v.crop] || 0) + (v.quantity_t || 0);
    });
    const topCrops = Object.entries(perCrop)
      .map(([crop, qty]) => ({ crop, qty }))
      .sort((a, b) => b.qty - a.qty);
    const months = ["Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025"];
    const base = Math.max(1, totalDemand);
    const timeseries = months.map((m, i) => ({ month: m, demand_t: +(base * (0.6 + i * 0.15)).toFixed(2) }));
    const pieData = Object.entries(perCrop).map(([name, value]) => ({ name, value }));
    return { totalDemand, uniqueCrops, topCrops, timeseries, pieData };
  }, [filtered]);

  // palette (light green accent)
  const palette = ["#6aa56b", "#E9C46A", "#F4A261", "#8AB6D6", "#A873FF", "#DDA15E", "#6B8E23"];

  // utility: formatted date
  const fmtDate = (d) => (d ? d : "—");

  // Pie label renderer: "CropName — XX%"
  const pieLabelRender = ({ name, percent }) => `${name} — ${Math.round(percent * 100)}%`;

  // ---------- Details handlers ----------
  function openDetails(vendor) {
    setSelectedVendor(vendor);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedVendor(null);
    setDetailsOpen(false);
  }

  // Vendor-specific analytics for modal
  const vendorMetrics = useMemo(() => {
    if (!selectedVendor) return null;
    const total = analytics.totalDemand || 0;
    const vendorQty = selectedVendor.quantity_t || 0;
    const sharePercent = total > 0 ? +(100 * vendorQty / total).toFixed(1) : 0;

    // small pie data: vendor vs rest
    const pie = [{ name: selectedVendor.vendorName, value: vendorQty }, { name: "Others", value: Math.max(0, total - vendorQty) }];

    // mock vendor timeseries: scale vendor qty across months
    const months = ["Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025"];
    const timeseries = months.map((m, i) => ({
      month: m,
      qty: +(vendorQty * (0.5 + i * 0.2)).toFixed(2),
    }));

    return { sharePercent, pie, timeseries, vendorQty, total };
  }, [selectedVendor, analytics]);


  return (
    <div className="market-page container py-4">
      <style>{`
        :root {
          --accent: #6aa56b;
          --muted: #6c757d;
          --card-bg: linear-gradient(180deg,#ffffff,#fbfff6);
          --soft-shadow: 0 8px 22px rgba(15,40,20,0.04);
        }
        .page-title { display:flex; gap:12px; align-items:center; }
        .small-muted { color: var(--muted); font-size:13px; }
        .vendor-card { border-radius:12px; background: #fff; border:1px solid rgba(20,80,40,0.04); transition: transform .16s, box-shadow .16s; }
        .vendor-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(10,35,20,0.05); }
        .badge-chip { padding:6px 10px; border-radius:999px; font-weight:700; color:#fff; box-shadow: 0 6px 18px rgba(10,30,10,0.04); }
        .vendors-scroll { max-height: 64vh; overflow-y: auto; padding-right: 8px; }
        .search-filter-row { gap: 10px; display:flex; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
        .sticky-analytics { position: sticky; top: 96px; }
        @media (max-width: 991px) {
          .sticky-analytics { position: static; top: auto; }
          .vendors-scroll { max-height: none; overflow: visible; padding-right: 0; }
        }
        /* Details modal custom */
        .modal-backdrop-custom { background: rgba(0,0,0,0.32); position: fixed; inset: 0; z-index: 1050; }
        .details-modal { z-index: 1060; position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; padding: 24px; }
        .details-card { width: 100%; max-width: 920px; border-radius:12px; box-shadow: 0 18px 50px rgba(6,30,10,0.12); overflow: hidden; }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="page-title">
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#f2fbf4", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <FaStore size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#153d2b", fontWeight: 800 }}>Market — Vendor Demand</h3>
            <div className="small-muted">Who needs what, where and when — connect quickly.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-outline-success btn-sm" onClick={() => alert("Export action placeholder")}>
            <FaDownload style={{ marginRight: 6 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="row g-4">
        <div className="col-lg-8">
          {/* Search + filter */}
          <div className="search-filter-row">
            <div className="input-group" style={{ flex: 1 }}>
              <span className="input-group-text bg-white"><FaSearch /></span>
              <input className="form-control" placeholder="Search vendor, crop or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="input-group" style={{ width: 220 }}>
              <span className="input-group-text bg-white"><FaFilter /></span>
              <select className="form-select" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
                {cropList.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          {/* Available vendors */}
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <div>
              <h5 style={{ margin: 0 }}>Available vendors</h5>
              <div className="small-muted">Showing {filtered.length} vendor(s)</div>
            </div>
            <div className="small-muted">Updated: {new Date().toISOString().slice(0, 10)}</div>
          </div>

          <div className="card p-3">
            <div className="vendors-scroll">
              {loading && <div className="p-4 text-center small-muted">Loading vendors...</div>}
              {!loading && filtered.length === 0 && <div className="p-4 text-center small-muted">No vendors match the current filters.</div>}
              {!loading && filtered.map((v) => (
                <div key={v.id} className="mb-3">
                  <div className="vendor-card p-3">
                    <div className="d-flex gap-3 align-items-start">
                      <div style={{ width: 64, height: 64, borderRadius: 12, background: "#f6fbf9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                        <FaMapMarkerAlt />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="d-flex justify-content-between">
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{v.vendorName}</div>
                          <div className="text-end small-muted">{fmtDate(v.required_by)}</div>
                        </div>

                        <div className="small-muted" style={{ marginTop: 6 }}>
                          <strong style={{ color: palette[0] }}>{v.crop}</strong> • {v.location}
                        </div>

                        <div className="d-flex flex-wrap align-items-center" style={{ marginTop: 12, gap: 8 }}>
                          <span className="badge-chip" style={{ background: palette[1] }}>{v.quantity_t} t</span>
                          <span className="badge-chip" style={{ background: palette[2] }}>Grade: {v.grade}</span>
                          <span className="badge-chip" style={{ background: palette[3] }}>{v.price_range}</span>

                          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                            <a className="btn btn-sm btn-outline-success" href={`tel:${v.contact}`}><FaPhoneAlt /></a>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => openDetails(v)}>Details</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="col-lg-4">
          <div className="card p-3 sticky-analytics" style={{ borderRadius: 12 }}>
            <div>
              <strong>Market Analytics</strong>
              <div className="small-muted">Summary & charts</div>
            </div>
            <hr />
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="small-muted">Total demand</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{analytics.totalDemand} t</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small-muted">Unique crops</div>
                  <div style={{ fontWeight: 800 }}>{analytics.uniqueCrops}</div>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: 160, marginBottom: 12 }}>
              <ResponsiveContainer>
                <BarChart data={analytics.topCrops}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crop" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty" fill={palette[0]}>
                    {analytics.topCrops.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={analytics.pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={70} innerRadius={28} label={pieLabelRender} labelLine={false}>
                    {analytics.pieData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => `${value} t`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3">
              <button className="btn btn-success w-100" onClick={() => alert("Export to CSV / contact list can be built here.")}>
                <FaDownload style={{ marginRight: 8 }} /> Export contacts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- DETAILS MODAL ---------- */}
      {detailsOpen && selectedVendor && (
        <>
          <div className="modal-backdrop-custom" onClick={closeDetails} />
          <div className="details-modal" role="dialog" aria-modal="true">
            <div className="details-card bg-white">
              <div style={{ display: "flex", justifyContent: "space-between", padding: 20, alignItems: "center", borderBottom: "1px solid #eef2ea" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "#f2fbf4", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h5 style={{ margin: 0 }}>{selectedVendor.vendorName}</h5>
                    <div className="small-muted">{selectedVendor.crop} • {selectedVendor.location}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a className="btn btn-outline-success" href={`tel:${selectedVendor.contact}`}><FaPhoneAlt style={{ marginRight: 8 }} />Call</a>
                  <button className="btn btn-outline-secondary" onClick={closeDetails}><FaTimes /></button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, padding: 20, flexWrap: "wrap" }}>
                {/* Left column: details table */}
                <div style={{ flex: "1 1 360px", minWidth: 280 }}>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>Details</div>
                  <div style={{ borderRadius: 8, background: "#fbfff6", padding: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><div className="small-muted">Vendor</div><div style={{ fontWeight: 800 }}>{selectedVendor.vendorName}</div></div>
                      <div><div className="small-muted">Contact</div><div style={{ fontWeight: 800 }}>{selectedVendor.contact}</div></div>

                      <div><div className="small-muted">Crop</div><div style={{ fontWeight: 800 }}>{selectedVendor.crop}</div></div>
                      <div><div className="small-muted">Grade</div><div style={{ fontWeight: 800 }}>{selectedVendor.grade}</div></div>

                      <div><div className="small-muted">Location</div><div style={{ fontWeight: 800 }}>{selectedVendor.location}</div></div>
                      <div><div className="small-muted">Required by</div><div style={{ fontWeight: 800 }}>{selectedVendor.required_by}</div></div>

                      <div><div className="small-muted">Quantity (t)</div><div style={{ fontWeight: 800 }}>{selectedVendor.quantity_t}</div></div>
                      <div><div className="small-muted">Price</div><div style={{ fontWeight: 800 }}>{selectedVendor.price_range}</div></div>

                      <div style={{ gridColumn: "1 / -1" }}><div className="small-muted">Notes</div><div style={{ fontWeight: 500, color: "#3c6b43" }}>No additional notes (sample data)</div></div>
                    </div>
                  </div>
                </div>

                {/* Right column: vendor metrics + charts */}
                <div style={{ width: 360, minWidth: 280 }}>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>Vendor metrics</div>

                  <div style={{ borderRadius: 8, background: "#fff", padding: 12, border: "1px solid rgba(10,30,10,0.03)" }}>
                    <div className="small-muted">Share of visible demand</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{vendorMetrics ? `${vendorMetrics.sharePercent}%` : "—"}</div>

                    <div style={{ width: "100%", height: 140, marginTop: 12 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={vendorMetrics ? vendorMetrics.pie : []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                            {(vendorMetrics ? vendorMetrics.pie : []).map((entry, idx) => (<Cell key={`vcell-${idx}`} fill={palette[idx % palette.length]} />))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} t`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="small-muted">Vendor demand trend (mock)</div>
                      <div style={{ width: "100%", height: 100 }}>
                        <ResponsiveContainer>
                          <LineChart data={vendorMetrics ? vendorMetrics.timeseries : []}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="qty" stroke={palette[0]} strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid #eef2ea" }}>
                <button className="btn btn-outline-secondary" onClick={closeDetails}>Close</button>
                <a className="btn btn-success" href={`tel:${selectedVendor.contact}`}><FaPhoneAlt style={{ marginRight: 8 }} /> Call vendor</a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
