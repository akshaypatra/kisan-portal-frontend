import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
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

export default function MarketPage() {
  // ---------- sample vendors (oilseeds only) ----------
  const sampleVendors = useMemo(
    () => [
      {
        id: 1,
        vendorName: "Shri Ram Oil Mills",
        crop: "Groundnut",
        location: "Rajkot, Gujarat",
        quantity_t: 15,
        grade: "FAQ",
        contact: "+91-98765-43210",
        required_by: "2025-12-05",
        price_range: "₹5700-6200",
      },
      {
        id: 2,
        vendorName: "GreenField Agro Oils",
        crop: "Soybean",
        location: "Indore, Madhya Pradesh",
        quantity_t: 20,
        grade: "A",
        contact: "+91-91234-56789",
        required_by: "2025-11-30",
        price_range: "₹4600-5100",
      },
      {
        id: 3,
        vendorName: "Village FPO Mustard Collective",
        crop: "Rapeseed-Mustard",
        location: "Alwar, Rajasthan",
        quantity_t: 10,
        grade: "FAQ",
        contact: "+91-99887-77665",
        required_by: "2025-11-28",
        price_range: "₹5400-5800",
      },
      {
        id: 4,
        vendorName: "Sunrise Oils & Fats",
        crop: "Sunflower",
        location: "Nanded, Maharashtra",
        quantity_t: 8,
        grade: "A",
        contact: "+91-90123-45678",
        required_by: "2025-12-10",
        price_range: "₹5600-6000",
      },
      {
        id: 5,
        vendorName: "UrbanFoods Oilseed Traders",
        crop: "Sesame (Til)",
        location: "Mumbai, Maharashtra",
        quantity_t: 5,
        grade: "Export",
        contact: "+91-92345-67890",
        required_by: "2025-11-26",
        price_range: "₹8500-9200",
      },
      {
        id: 6,
        vendorName: "Harvest Hub Agro",
        crop: "Mustard",
        location: "Akola, Maharashtra",
        quantity_t: 7,
        grade: "Special",
        contact: "+91-93456-78901",
        required_by: "2025-12-02",
        price_range: "₹5200-5600",
      },
      {
        id: 7,
        vendorName: "Rural Connect Oils",
        crop: "Soybean",
        location: "Nashik, Maharashtra",
        quantity_t: 6,
        grade: "B",
        contact: "+91-94567-89012",
        required_by: "2025-12-03",
        price_range: "₹4400-4800",
      },
      {
        id: 8,
        vendorName: "Kisan Safflower Processors",
        crop: "Safflower",
        location: "Latur, Maharashtra",
        quantity_t: 4,
        grade: "FAQ",
        contact: "+91-95678-90123",
        required_by: "2025-12-08",
        price_range: "₹5000-5400",
      },
      {
        id: 9,
        vendorName: "Niger Gold Traders",
        crop: "Niger Seed",
        location: "Jabalpur, Madhya Pradesh",
        quantity_t: 3,
        grade: "A",
        contact: "+91-96789-01234",
        required_by: "2025-11-29",
        price_range: "₹7000-7600",
      },
      {
        id: 10,
        vendorName: "Castor King Exports",
        crop: "Castor",
        location: "Kadi, Gujarat",
        quantity_t: 18,
        grade: "Export",
        contact: "+91-97890-12345",
        required_by: "2025-12-12",
        price_range: "₹5200-5600",
      },
      {
        id: 11,
        vendorName: "Linseed Agro LLP",
        crop: "Linseed",
        location: "Kanpur, Uttar Pradesh",
        quantity_t: 6,
        grade: "A",
        contact: "+91-98901-23456",
        required_by: "2025-12-06",
        price_range: "₹6200-6700",
      },
      {
        id: 12,
        vendorName: "Oil Palm Fresh Fruit Traders",
        crop: "Oil Palm",
        location: "Khammam, Telangana",
        quantity_t: 25,
        grade: "FFB",
        contact: "+91-98123-45098",
        required_by: "2025-11-27",
        price_range: "₹8500-9200 (per t FFB)",
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
  const [selectedVendor, setSelectedVendor] = useState(null);
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

  // derived crop list (oilseeds only from sampleVendors)
  const cropList = useMemo(
    () => ["All", ...Array.from(new Set(sampleVendors.map((v) => v.crop)))],
    [sampleVendors]
  );

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
    const totalDemand = filtered.reduce(
      (s, v) => s + (v.quantity_t || 0),
      0
    );
    const uniqueCrops = new Set(filtered.map((v) => v.crop)).size;

    // distribution of demand by crop (for bar chart)
    const perCrop = {};
    filtered.forEach((v) => {
      perCrop[v.crop] = (perCrop[v.crop] || 0) + (v.quantity_t || 0);
    });

    const cropDistribution = Object.entries(perCrop)
      .map(([crop, qty]) => ({ crop, qty }))
      .sort((a, b) => b.qty - a.qty);

    // simple time trend (uses totalDemand as base)
    const months = ["Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025"];
    const base = Math.max(1, totalDemand || 1);
    const timeseries = months.map((m, i) => ({
      month: m,
      demand_t: +(base * (0.6 + i * 0.15)).toFixed(2),
    }));

    return { totalDemand, uniqueCrops, cropDistribution, timeseries };
  }, [filtered]);

  // palette (light green accent)
  const palette = [
    "#6aa56b",
    "#E9C46A",
    "#F4A261",
    "#8AB6D6",
    "#A873FF",
    "#DDA15E",
    "#6B8E23",
  ];

  const fmtDate = (d) => (d ? d : "—");

  // ---------- Details handlers ----------
  function openDetails(vendor) {
    setSelectedVendor(vendor);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedVendor(null);
    setDetailsOpen(false);
  }

  // Vendor-specific metrics (text only now, no extra charts)
  const vendorMetrics = useMemo(() => {
    if (!selectedVendor) return null;
    const total = analytics.totalDemand || 0;
    const vendorQty = selectedVendor.quantity_t || 0;
    const sharePercent =
      total > 0 ? +(100 * (vendorQty / total)).toFixed(1) : 0;

    return { sharePercent, vendorQty, total };
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
        .modal-backdrop-custom { background: rgba(0,0,0,0.32); position: fixed; inset: 0; z-index: 1050; }
        .details-modal { z-index: 1060; position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; padding: 24px; }
        .details-card { width: 100%; max-width: 920px; border-radius:12px; box-shadow: 0 18px 50px rgba(6,30,10,0.12); overflow: hidden; }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="page-title">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#f2fbf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <FaStore size={22} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                color: "#153d2b",
                fontWeight: 800,
              }}
            >
              Oilseed Market — Vendor Demand
            </h3>
            <div className="small-muted">
              Clean distribution view of oilseed requirements.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => alert("Export action placeholder")}
          >
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
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>
              <input
                className="form-control"
                placeholder="Search vendor, oilseed or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ width: 260 }}>
              <span className="input-group-text bg-white">
                <FaFilter />
              </span>
              <select
                className="form-select"
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
              >
                {cropList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Available vendors */}
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <div>
              <h5 style={{ margin: 0 }}>Available oilseed buyers</h5>
              <div className="small-muted">
                Showing {filtered.length} vendor(s)
              </div>
            </div>
            <div className="small-muted">
              Updated: {new Date().toISOString().slice(0, 10)}
            </div>
          </div>

          <div className="card p-3">
            <div className="vendors-scroll">
              {loading && (
                <div className="p-4 text-center small-muted">
                  Loading vendors...
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="p-4 text-center small-muted">
                  No vendors match the current filters.
                </div>
              )}
              {!loading &&
                filtered.map((v) => (
                  <div key={v.id} className="mb-3">
                    <div className="vendor-card p-3">
                      <div className="d-flex gap-3 align-items-start">
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 12,
                            background: "#f6fbf9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent)",
                          }}
                        >
                          <FaMapMarkerAlt />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="d-flex justify-content-between">
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 16,
                              }}
                            >
                              {v.vendorName}
                            </div>
                            <div className="text-end small-muted">
                              {fmtDate(v.required_by)}
                            </div>
                          </div>

                          <div
                            className="small-muted"
                            style={{ marginTop: 6 }}
                          >
                            <strong style={{ color: palette[0] }}>
                              {v.crop}
                            </strong>{" "}
                            • {v.location}
                          </div>

                          <div
                            className="d-flex flex-wrap align-items-center"
                            style={{ marginTop: 12, gap: 8 }}
                          >
                            <span
                              className="badge-chip"
                              style={{ background: palette[1] }}
                            >
                              {v.quantity_t} t
                            </span>
                            <span
                              className="badge-chip"
                              style={{ background: palette[2] }}
                            >
                              Grade: {v.grade}
                            </span>
                            <span
                              className="badge-chip"
                              style={{ background: palette[3] }}
                            >
                              {v.price_range}
                            </span>

                            <div
                              style={{
                                marginLeft: "auto",
                                display: "flex",
                                gap: 8,
                              }}
                            >
                              <a
                                className="btn btn-sm btn-outline-success"
                                href={`tel:${v.contact}`}
                              >
                                <FaPhoneAlt />
                              </a>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => openDetails(v)}
                              >
                                Details
                              </button>
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
          <div
            className="card p-3 sticky-analytics"
            style={{ borderRadius: 12 }}
          >
            <div>
              <strong>Oilseed Demand Distribution</strong>
              <div className="small-muted">Clean view by crop & time</div>
            </div>
            <hr />
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="small-muted">Total demand</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--accent)",
                    }}
                  >
                    {analytics.totalDemand} t
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small-muted">Unique oilseeds</div>
                  <div style={{ fontWeight: 800 }}>
                    {analytics.uniqueCrops}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution by crop (bar chart) */}
            <div className="mb-3">
              <div className="small-muted mb-1">
                Distribution by oilseed (tonnes)
              </div>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={analytics.cropDistribution}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="crop" angle={-20} textAnchor="end" />
                    <YAxis />
                    <Tooltip formatter={(v) => `${v} t`} />
                    <Bar dataKey="qty" radius={[4, 4, 0, 0]} fill={palette[0]}>
                      {analytics.cropDistribution.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={palette[idx % palette.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simple time trend (line chart) */}
            <div>
              <div className="small-muted mb-1">
                Overall demand trend (mock, monthly)
              </div>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.timeseries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => `${v} t`} />
                    <Line
                      type="monotone"
                      dataKey="demand_t"
                      stroke={palette[0]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- DETAILS MODAL ---------- */}
      {detailsOpen && selectedVendor && (
        <>
          <div className="modal-backdrop-custom" onClick={closeDetails} />
          <div
            className="details-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="details-card bg-white">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 20,
                  alignItems: "center",
                  borderBottom: "1px solid #eef2ea",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: "#f2fbf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent)",
                    }}
                  >
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h5 style={{ margin: 0 }}>
                      {selectedVendor.vendorName}
                    </h5>
                    <div className="small-muted">
                      {selectedVendor.crop} • {selectedVendor.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    className="btn btn-outline-success"
                    href={`tel:${selectedVendor.contact}`}
                  >
                    <FaPhoneAlt style={{ marginRight: 8 }} />
                    Call
                  </a>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={closeDetails}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  padding: 20,
                  flexWrap: "wrap",
                }}
              >
                {/* Left column: details table */}
                <div style={{ flex: "1 1 360px", minWidth: 280 }}>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>
                    Details
                  </div>
                  <div
                    style={{
                      borderRadius: 8,
                      background: "#fbfff6",
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div className="small-muted">Vendor</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.vendorName}
                        </div>
                      </div>
                      <div>
                        <div className="small-muted">Contact</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.contact}
                        </div>
                      </div>

                      <div>
                        <div className="small-muted">Oilseed</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.crop}
                        </div>
                      </div>
                      <div>
                        <div className="small-muted">Grade</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.grade}
                        </div>
                      </div>

                      <div>
                        <div className="small-muted">Location</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.location}
                        </div>
                      </div>
                      <div>
                        <div className="small-muted">Required by</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.required_by}
                        </div>
                      </div>

                      <div>
                        <div className="small-muted">Quantity (t)</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.quantity_t}
                        </div>
                      </div>
                      <div>
                        <div className="small-muted">Price</div>
                        <div style={{ fontWeight: 800 }}>
                          {selectedVendor.price_range}
                        </div>
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="small-muted">Notes</div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "#3c6b43",
                          }}
                        >
                          No additional notes (sample oilseed demand data).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: vendor metrics (text only) */}
                <div style={{ width: 320, minWidth: 260 }}>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>
                    Vendor metrics
                  </div>

                  <div
                    style={{
                      borderRadius: 8,
                      background: "#fff",
                      padding: 12,
                      border: "1px solid rgba(10,30,10,0.03)",
                    }}
                  >
                    <div className="small-muted mb-2">
                      Share of visible oilseed demand
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "var(--accent)",
                      }}
                    >
                      {vendorMetrics
                        ? `${vendorMetrics.sharePercent}%`
                        : "—"}
                    </div>

                    {vendorMetrics && (
                      <>
                        <div className="small-muted mt-3">
                          Vendor demand vs total
                        </div>
                        <div
                          className="small-muted"
                          style={{ marginTop: 6 }}
                        >
                          Vendor:{" "}
                          <strong>
                            {vendorMetrics.vendorQty} t
                          </strong>
                        </div>
                        <div className="small-muted">
                          Total (filtered view):{" "}
                          <strong>{vendorMetrics.total} t</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  padding: 16,
                  borderTop: "1px solid #eef2ea",
                }}
              >
                <button
                  className="btn btn-outline-secondary"
                  onClick={closeDetails}
                >
                  Close
                </button>
                <a
                  className="btn btn-success"
                  href={`tel:${selectedVendor.contact}`}
                >
                  <FaPhoneAlt style={{ marginRight: 8 }} /> Call vendor
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
