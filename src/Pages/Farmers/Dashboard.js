import React, { useEffect, useMemo, useState } from "react";
//eslint-disable-next-line no-unused-vars
import WeatherWidget from "../../Components/Weather-component/WeatherWidget";
import AIVoiceAssistant from "../../Components/AI-Assistant/AIVoiceAssistant";
import { useNavigate } from "react-router-dom";
import {
  FaSeedling,
  //eslint-disable-next-line no-unused-vars
  FaNewspaper,
  FaRegNewspaper,
  FaStore,
  FaChartLine,
  FaMap,
  FaLeaf,
  FaRulerCombined,
  FaClock,
  FaTractor,
  FaChartBar,
  FaMapMarkedAlt,
  FaTruck,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import QRCode from "react-qr-code";
import api from "../../services/api";

/**
 * Dashboard:
 * - Top analytics (KPIs)
 * - Total Production graph (line+bar)
 * - Crop share pie
 * - Then "Your Fields" cards (as previously requested)
 *
 * Note: ensure `recharts` is installed: `npm i recharts`
 */

const PLOTS_ENDPOINT = "/api/plots";
const SQM_PER_ACRE = 4046.85642;

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const farmerId = currentUser?.id;
  const [fields, setFields] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const buttons = [
    {
      name: "AI Advisory",
      icon: <FaChartLine size={32} />,
      path: "/ai-advisory",
      color: "#4CAF50",
    },
    {
      name: "Market",
      icon: <FaStore size={32} />,
      path: "/market",
      color: "#2196F3",
    },
    {
      name: "Sell Crops",
      icon: <FaSeedling size={32} />,
      path: "/sell-crops",
      color: "#8BC34A",
    },
    {
      name: "Book Transport",
      icon: <FaTruck size={32} />,
      path: "/new-book-transport",
      color: "#10b981",
    },
    {
      name: "Insurance and Credit Schemes",
      icon: <FaRegNewspaper size={32} />,
      path: "/oilseed-credit-insurance-page",
      color: "#19d2f3ff",
    },
  ];

  // ---------- SAMPLE DATA (replace with API results) ----------
  // Each field: crops: { name, ratio (percent of field), yield_t_per_ha }
  const baseSampleFields = useMemo(
    () => [
      {
        id: 1,
        name: "Field A - Riverside",
        area_ha: 2.4,
        stage: "Flowering",
        crops: [
          { name: "Wheat", ratio: 60, yield_t_per_ha: 3.2 },
          { name: "Mustard", ratio: 40, yield_t_per_ha: 1.1 },
        ],
        last_updated: "2025-11-20",
      },
      {
        id: 2,
        name: "North Plot",
        area_ha: 1.1,
        stage: "Sowing",
        crops: [{ name: "Maize", ratio: 100, yield_t_per_ha: 5.0 }],
        last_updated: "2025-11-18",
      },
      {
        id: 3,
        name: "South Orchard",
        area_ha: 0.8,
        stage: "Harvesting",
        crops: [
          { name: "Tomato", ratio: 70, yield_t_per_ha: 25.0 },
          { name: "Chili", ratio: 20, yield_t_per_ha: 4.0 },
          { name: "Basil", ratio: 10, yield_t_per_ha: 1.2 },
        ],
        last_updated: "2025-11-21",
      },
      {
        id: 4,
        name: "West Meadow",
        area_ha: 1.9,
        stage: "Growing",
        crops: [
          { name: "Wheat", ratio: 50, yield_t_per_ha: 3.0 },
          { name: "Barley", ratio: 50, yield_t_per_ha: 2.2 },
        ],
        last_updated: "2025-11-19",
      },
    ],
    []
  );
  const normalizedSampleFields = useMemo(
    () => baseSampleFields.map(normalizeSampleField),
    [baseSampleFields]
  );

  useEffect(() => {
    fetchPlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function normalizeSampleField(f) {
    const area_acres = (f.area_ha || 0) * 2.47105;
    const crops = (f.crops || []).map((c) => {
      const areaFromRatio = area_acres * ((c.ratio || 0) / 100);
      return { ...c, area_acres: +areaFromRatio.toFixed(2), ratio: c.ratio ?? 0 };
    });
    return { ...f, area_acres: +area_acres.toFixed(2), crops, routeKey: String(f.id) };
  }

  function mapPlotToField(plot) {
    const derivedAreaAcres = plot.calculated_area_sqm
      ? +(plot.calculated_area_sqm / SQM_PER_ACRE).toFixed(2)
      : +(plot.user_provided_area || 0);
    const cropCycles = Array.isArray(plot.crop_cycles)
      ? plot.crop_cycles
      : Array.isArray(plot.cycles)
      ? plot.cycles
      : [];
    const activeCycles = cropCycles.filter(
      (c) => (c.status || "").toLowerCase() !== "harvested"
    );
    const fallbackArea = activeCycles.reduce((sum, c) => sum + (c.area_acres || 0), 0);
    const totalArea = derivedAreaAcres || fallbackArea || 0;

    const crops = activeCycles.map((c) => {
      const area = c.area_acres || 0;
      const ratio = totalArea > 0 ? (area / totalArea) * 100 : 100;
      const harvestEvents = (c.harvest_events || c.harvests || []).map((event) => ({
        id: event.id,
        harvested_on: event.harvested_on,
        harvested_qty: event.harvested_qty,
        harvested_area_acres: event.harvested_area_acres,
      }));
      const harvestedQtyTotal =
        c.harvested_qty_total ??
        harvestEvents.reduce((sum, evt) => sum + (evt.harvested_qty || 0), 0);
      const estYieldTPerHa =
        area > 0
          ? ((harvestedQtyTotal || 0) / 1000) / (area * 0.404686)
          : 0;

      return {
        name: c.crop_name,
        ratio: +ratio.toFixed(2),
        yield_t_per_ha: +estYieldTPerHa.toFixed(2),
        stage: c.status,
        area_acres: area,
        harvests: harvestEvents,
        harvested_qty_total: harvestedQtyTotal || 0,
        harvested_area_total:
          c.harvested_area_total ??
          harvestEvents.reduce(
            (sum, evt) => sum + (evt.harvested_area_acres || 0),
            0
          ),
      };
    });

  const areaHa = totalArea * 0.404686;

  return {
    id: `db-${plot.id}`,
    dbId: plot.id,
    routeKey: String(plot.id),
    name: plot.plot_name,
      area_ha: +areaHa.toFixed(2),
      area_acres: +totalArea.toFixed(2),
      stage: (plot.status && (plot.status.stage || plot.status.status)) || "Registered",
      crops,
      last_updated: plot.updated_at
        ? plot.updated_at.slice(0, 10)
        : plot.created_at
        ? plot.created_at.slice(0, 10)
        : "",
    };
  }

  async function fetchPlots() {
    setLoadingPlots(true);
    try {
      if (!farmerId) {
        setFields(normalizedSampleFields);
        return;
      }
      const { data } = await api.get(`${PLOTS_ENDPOINT}/with-cycles/${farmerId}`);
      const mapped = Array.isArray(data) ? data.map(mapPlotToField) : [];
      setFields(mapped);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 404) {
        setFields([]);
      } else {
        setFields(normalizedSampleFields);
      }
    } finally {
      setLoadingPlots(false);
    }
  }


  // ---------- UI helpers ----------
  const cropColors = [
    "#7BB661",
    "#F4A261",
    "#E76F51",
    "#2A9D8F",
    "#E9C46A",
    "#264653",
    "#8AB6D6",
    "#A873FF",
  ];
  const getCropColor = (i) => cropColors[i % cropColors.length];

  // ---------- COMPUTED ANALYTICS ----------
  // Total fields & area
  const analytics = useMemo(() => {
    const totalFields = fields.length;
    const totalArea = fields.reduce((s, f) => s + (f.area_ha || 0), 0);

    // Compute estimated production per field and aggregate per crop
    const cropAggregate = {}; // cropName -> total production (tons)
    let totalProduction = 0; // tons

    for (const f of fields) {
      for (const c of f.crops) {
        const cRatio = c.ratio ?? 100;
        const areaForCrop = (f.area_ha * cRatio) / 100.0; // hectares
        const estimatedProduction = (areaForCrop * (c.yield_t_per_ha || 0)); // tons
        totalProduction += estimatedProduction;

        cropAggregate[c.name] = (cropAggregate[c.name] || 0) + estimatedProduction;
      }
    }

    // average yield per ha (weighted)
    const avgYieldPerHa = totalArea > 0 ? totalProduction / totalArea : 0;

    return {
      totalFields,
      totalArea: +totalArea.toFixed(2),
      totalProduction: +totalProduction.toFixed(2),
      avgYieldPerHa: +avgYieldPerHa.toFixed(2),
      cropAggregate,
    };
  }, [fields]);

  // ---------- SAMPLE MONTHLY PRODUCTION (for timeseries) ----------
  // If you have real monthly data use that. Here we create a sample timeseries
  const monthlyProduction = useMemo(() => {
    // sample: last 6 months — make trend from totalProduction
    const base = analytics.totalProduction || 20;
    const months = [
      "Jun 2025",
      "Jul 2025",
      "Aug 2025",
      "Sep 2025",
      "Oct 2025",
      "Nov 2025",
    ];
    // create gentle variation
    return months.map((m, i) => {
      const factor = 0.75 + (i / (months.length - 1)) * 0.6; // 0.75 -> 1.35
      const prod = +(base * factor * (0.6 + Math.random() * 0.8)).toFixed(2);
      return { month: m, production_t: prod, forecast_t: +(prod * 1.05).toFixed(2) };
    });
  }, [analytics.totalProduction]);

  // Pie chart data from cropAggregate
  const cropPieData = useMemo(() => {
    const entries = Object.entries(analytics.cropAggregate || {});
    return entries.map(([name, prod]) => ({ name, value: +prod.toFixed(2) }));
  }, [analytics.cropAggregate]);

  // ---------- RENDER ----------
  return (
    <div className="dashboard-container p-3">
      <AIVoiceAssistant />

      <div className="dashboard-weather-widget-container mb-3">
        <WeatherWidget />
      </div>

      <div className="dashboard-button-container mb-3">
        <style>
          {`
          /* Buttons */
          .dash-btn-card {
            height: 110px;
            border-radius: 16px;
            cursor: pointer;
            transition: 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .dash-btn-card:hover { transform: scale(1.04); }

          .dash-btn-body {
            border-radius: 16px;
            padding: 18px 10px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .dash-btn-body h6 { margin-top: 8px; font-weight: 700; }

          /* Analytics area */
          .analytics-section {
            margin-top: 18px;
            margin-bottom: 18px;
          }

          .kpi-card {
            border-radius: 12px;
            padding: 14px;
            background: #fff;
            box-shadow: 0 6px 18px rgba(15,40,20,0.04);
            display:flex;
            flex-direction:column;
            gap:6px;
            min-height: 100%;
          }
          .kpi-value { font-size: 20px; font-weight:800; }
          .kpi-label  { color: #6c757d; font-size: 13px; }

          /* Charts container */
          .charts-row {
            margin-top: 12px;
          }

          /* keep fields cards look as before (copied & slightly adjusted) */
          .field-card {
            border-radius: 12px;
            overflow: hidden;
            transition: transform .15s, box-shadow .15s;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            height: 100%;
            background: linear-gradient(180deg, #ffffff, #fbfffb);
          }
          .field-card:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(15,40,20,0.08); }

          .field-top {
            display:flex;
            justify-content: space-between;
            align-items:center;
            padding: 12px 14px;
            background: linear-gradient(90deg, rgba(39, 174, 96,0.06), rgba(46, 204, 113,0.02));
          }
          .field-body { padding: 14px; flex: 1 1 auto; display:flex; flex-direction:column; gap:10px; }
          .crop-badges { display:flex; gap:8px; flex-wrap:wrap; }
          .ratio-bar { display:flex; height: 18px; border-radius: 8px; overflow: hidden; background: #f1f1f1; border: 1px solid rgba(0,0,0,0.04); }
          .ratio-segment { display:flex; align-items:center; justify-content:center; font-size: 12px; color: rgba(255,255,255,0.95); font-weight:600; white-space:nowrap; padding: 0 6px; }
          .field-meta { display:flex; gap:12px; align-items:center; color: #6c757d; font-size: 13px; }
        `}
        </style>

        <div className="container">
          <div className="row g-4 justify-content-center">
            {buttons.map((btn, idx) => (
              <div className="col-6 col-md-3 d-flex" key={idx}>
                <div
                  className="card shadow-sm w-100 dash-btn-card"
                  onClick={() => navigate(btn.path)}
                >
                  <div
                    className="dash-btn-body text-white w-100"
                    style={{ background: btn.color }}
                  >
                    <div>{btn.icon}</div>
                    <h6>{btn.name}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="dashboard-weather-widget-container mb-3">
        <WeatherWidget />
      </div> */}

      {/* ---------- OVERALL ANALYTICS ---------- */}
      <div className="analytics-section">
        
        <div className="container" id="analytics-section-card">
          <h3>< FaChartBar/> Analytics</h3>
          {/* KPI cards */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="kpi-card">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-value">{analytics.totalFields}</div>
                    <div className="kpi-label">Total fields</div>
                  </div>
                  <div style={{ fontSize: 22, color: "#2f7a3a" }}>
                    <FaMap />
                  </div>
                </div>
                <small className="text-muted">Quick count of your fields</small>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="kpi-card">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-value">{analytics.totalArea} ha</div>
                    <div className="kpi-label">Total area</div>
                  </div>
                  <div style={{ fontSize: 22, color: "#1e90ff" }}>
                    <FaRulerCombined />
                  </div>
                </div>
                <small className="text-muted">Sum of all fields' areas</small>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="kpi-card">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-value">{analytics.totalProduction} t</div>
                    <div className="kpi-label">Est. total production</div>
                  </div>
                  <div style={{ fontSize: 22, color: "#f39c12" }}>
                    <FaTractor />
                  </div>
                </div>
                <small className="text-muted">Estimated (area × crop yield)</small>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="kpi-card">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-value">{analytics.avgYieldPerHa} t/ha</div>
                    <div className="kpi-label">Avg yield / ha</div>
                  </div>
                  <div style={{ fontSize: 22, color: "#6f42c1" }}>
                    <FaLeaf />
                  </div>
                </div>
                <small className="text-muted">Weighted average yield</small>
              </div>
            </div>
          </div>

          {/* charts row */}
          <div className="row charts-row g-4 align-items-center">
            <div className="col-12 col-lg-7">
              <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>Total production</strong>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Trend over last months (tons)
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Estimated: <strong>{analytics.totalProduction} t</strong>
                  </div>
                </div>

                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={monthlyProduction} margin={{ top: 6, right: 18, left: 0, bottom: 6 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="production_t"
                        stroke="#2f7a3a"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Bar dataKey="forecast_t" barSize={18} fill="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>Crop share (by production)</strong>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Distribution of estimated production
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Total crops: <strong>{Object.keys(analytics.cropAggregate).length}</strong>
                  </div>
                </div>

                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={cropPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={38}
                        label={(entry) => `${entry.name} (${Math.round((entry.value / (analytics.totalProduction || 1)) * 100)}%)`}
                      >
                        {cropPieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={getCropColor(idx)} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* analytics-section */}

      {/* ---------- AVAILABLE FIELDS ---------- */}
      <div className="dashobard-available-Fields-container fields-section">
        <div className="container" id="fields-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0 d-flex align-items-center gap-2">
              <FaMap style={{ marginRight: 8 }} /> Your Fields
              {loadingPlots && <span className="text-muted small">(syncing)</span>}
            </h4>
            <button
            className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "0.3s ease",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={() => navigate("/plot-registration")}
            >
              <FaMapMarkedAlt size={20} /> Register New Plot
            </button>
          </div>

          <div className="row g-4">
            {fields.map((field, fIdx) => {
              const declaredAcres = Number(field.area_acres) || Number(field.area_ha || 0) / 0.404686 || 0;
              const usedAcres = (field.crops || []).reduce(
                (sum, c) => sum + (Number(c.area_acres) || 0),
                0
              );
              const remainingAcres = Math.max(0, +(declaredAcres - usedAcres).toFixed(2));
              const totalRatio = field.crops.reduce((s, c) => s + (c.ratio || 0), 0) || 0;
              const remainder = Math.max(0, 100 - totalRatio);
              const plotIdentifier = field.dbId ?? field.id;
              const routeKey = field.routeKey || (field.dbId ? String(field.dbId) : String(field.id));
              const qrValue = JSON.stringify({
                plot_id: plotIdentifier,
                plot_name: field.name,
              });
              return (
                <div key={field.id} className="col-12 col-md-6 col-lg-4 d-flex">
                  <div className="card field-card shadow-sm w-100">
                    <div className="field-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width:46, height:46, borderRadius:12, background:"#f3fbf2",
                          display:"flex", alignItems:"center", justifyContent:"center", color:"#2f7a3a"
                        }}>
                          <FaLeaf size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight:700 }}>{field.name}</div>
                          <div style={{ fontSize:13, color:"#6c757d" }}>{field.stage}</div>
                        </div>
                      </div>

                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:14, fontWeight:700 }}>
                          {field.area_ha} ha
                        </div>
                        <div style={{ fontSize:12, color:"#6c757d" }}>
                          updated {field.last_updated}
                        </div>
                      </div>
                    </div>

                    <div className="field-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="small text-muted">Plot ID</div>
                          <div className="fw-bold text-success">
                            #{plotIdentifier}
                          </div>
                        </div>
                        <div className="text-center">
                          <QRCode value={qrValue} size={80} bgColor="#ffffff" />
                          <div className="small text-muted mt-1">Scan plot</div>
                        </div>
                      </div>

                      <div className="crop-badges">
                        {field.crops.map((c, i) => (
                          <span
                            key={i}
                            className="badge rounded-pill"
                            style={{
                              background: getCropColor((fIdx + i)),
                              color: "#fff",
                              padding: "6px 10px",
                              fontWeight:700,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            }}
                          >
                            {c.name} • {c.ratio}%
                          </span>
                        ))}
                      </div>

                      <div>
                        <div style={{ fontSize: 13, marginBottom: 6, color: "#495057", fontWeight:700 }}>
                          Crop mix
                        </div>

                        <div className="ratio-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                          {field.crops.map((c, i) => {
                            const widthPercent = Math.max(0, Math.round(c.ratio));
                            return (
                              <div
                                key={i}
                                className="ratio-segment"
                                style={{
                                  width: `${widthPercent}%`,
                                  background: getCropColor((fIdx + i)),
                                  fontSize: 12,
                                  justifyContent: widthPercent > 10 ? "center" : "flex-end",
                                  paddingLeft: widthPercent > 10 ? 0 : 6,
                                }}
                                title={`${c.name}: ${c.ratio}%`}
                              >
                                {widthPercent > 8 ? `${c.ratio}%` : null}
                              </div>
                            );
                          })}
                          {remainder > 0 && (
                            <div
                              className="ratio-segment"
                              style={{
                                width: `${Math.round(remainder)}%`,
                                background: "#e9ecef",
                                color: "#6c757d",
                                justifyContent: "center",
                              }}
                              title={`Unassigned: ${Math.round(remainder)}%`}
                            >
                              {remainder > 8 ? `${Math.round(remainder)}%` : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="field-meta">
                        <div className="d-flex align-items-center" title="Stage">
                          <FaClock style={{ marginRight: 8 }} /> <small style={{ marginRight:6 }}>{field.stage}</small>
                        </div>
                        <div className="d-flex align-items-center" title="Area">
                          <FaRulerCombined style={{ marginRight: 8 }} /> <small>{field.area_ha} ha</small>
                        </div>
                        <div className="d-flex align-items-center" title="Number of crops">
                          <FaSeedling style={{ marginRight: 8 }} /> <small>{field.crops.length} crop{field.crops.length>1?"s":""}</small>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, gap: 8 }}>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            navigate(`/manage-fields/${routeKey}`);
                          }}
                        >
                          Manage
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={remainingAcres <= 0}
                          title={
                            remainingAcres > 0
                              ? "Plan crops for the unused area"
                              : "No free area left"
                          }
                          onClick={() => {
                            if (remainingAcres <= 0) return;
                            navigate(`/crop-planning/${routeKey}`);
                          }}
                        >
                          Crop Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
