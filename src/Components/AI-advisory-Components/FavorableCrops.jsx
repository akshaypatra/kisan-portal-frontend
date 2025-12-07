// AIAdvisoryDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaSeedling,
  FaSun,
  FaTint,
  FaChartLine,
  FaChartBar,
  FaCheck,
  FaLeaf,
  FaBug,
  FaWater,
  FaMapMarkedAlt,
  FaGlobe,
  FaCrop,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/* ---------- REGION_META (your data) ---------- */
const REGION_META = {
  Maharashtra: {
    Pune: { rainfall: "medium", suitable: ["Soybean", "Groundnut", "Sugarcane", "Wheat"] },
    Nagpur: { rainfall: "low", suitable: ["Cotton", "Soybean"] },
    Nashik: { rainfall: "medium", suitable: ["Grapes", "Onion", "Maize"] },
    Kolhapur: { rainfall: "high", suitable: ["Sugarcane", "Rice"] },
    Aurangabad: { rainfall: "low", suitable: ["Cotton", "Jowar", "Bajra"] },
  },
  Karnataka: {
    Bengaluru: { rainfall: "medium", suitable: ["Ragi", "Millets", "Vegetables"] },
    Mysuru: { rainfall: "high", suitable: ["Sugarcane", "Paddy"] },
    Belagavi: { rainfall: "medium", suitable: ["Maize", "Soybean"] },
    Kalaburagi: { rainfall: "low", suitable: ["Tur Dal", "Cotton"] },
  },
  Gujarat: {
    Ahmedabad: { rainfall: "low", suitable: ["Cotton", "Groundnut"] },
    Surat: { rainfall: "medium", suitable: ["Rice", "Sugarcane"] },
    Rajkot: { rainfall: "low", suitable: ["Groundnut", "Cotton"] },
    Vadodara: { rainfall: "medium", suitable: ["Maize", "Pulses"] },
  },
  Rajasthan: {
    Jaipur: { rainfall: "low", suitable: ["Mustard", "Bajra"] },
    Jodhpur: { rainfall: "low", suitable: ["Guar", "Bajra"] },
    Udaipur: { rainfall: "medium", suitable: ["Maize", "Soybean"] },
    Kota: { rainfall: "medium", suitable: ["Wheat", "Soybean"] },
  },
  "Madhya Pradesh": {
    Indore: { rainfall: "medium", suitable: ["Soybean", "Wheat"] },
    Bhopal: { rainfall: "medium", suitable: ["Paddy", "Wheat"] },
    Gwalior: { rainfall: "low", suitable: ["Mustard", "Gram"] },
    Jabalpur: { rainfall: "high", suitable: ["Rice", "Sugarcane"] },
  },
  "Uttar Pradesh": {
    Lucknow: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Varanasi: { rainfall: "high", suitable: ["Paddy", "Sugarcane"] },
    Kanpur: { rainfall: "medium", suitable: ["Wheat", "Gram"] },
    Meerut: { rainfall: "medium", suitable: ["Sugarcane", "Wheat"] },
  },
  Bihar: {
    Patna: { rainfall: "high", suitable: ["Paddy", "Maize"] },
    Gaya: { rainfall: "medium", suitable: ["Wheat", "Gram"] },
    Bhagalpur: { rainfall: "high", suitable: ["Maize", "Paddy"] },
  },
  "West Bengal": {
    Kolkata: { rainfall: "high", suitable: ["Rice", "Jute"] },
    Darjeeling: { rainfall: "high", suitable: ["Tea", "Vegetables"] },
    Burdwan: { rainfall: "medium", suitable: ["Rice", "Potato"] },
  },
  Odisha: {
    Bhubaneswar: { rainfall: "high", suitable: ["Rice", "Pulses"] },
    Cuttack: { rainfall: "high", suitable: ["Rice", "Sesame"] },
    Sambalpur: { rainfall: "medium", suitable: ["Cotton", "Paddy"] },
    Rourkela: {
      rainfall: "medium",
      suitable: ["Paddy", "Maize", "Groundnut", "Greengram", "Blackgram", "Millets", "Mustard"],
    },
  },
  Telangana: {
    Hyderabad: { rainfall: "low", suitable: ["Cotton", "Red Gram"] },
    Warangal: { rainfall: "medium", suitable: ["Rice", "Maize"] },
    Nizamabad: { rainfall: "medium", suitable: ["Turmeric", "Maize"] },
  },
  "Andhra Pradesh": {
    Vijayawada: { rainfall: "medium", suitable: ["Paddy", "Banana"] },
    Guntur: { rainfall: "low", suitable: ["Chilli", "Cotton"] },
    Visakhapatnam: { rainfall: "high", suitable: ["Coconut", "Cashew"] },
  },
  "Tamil Nadu": {
    Chennai: { rainfall: "low", suitable: ["Millets", "Groundnut"] },
    Coimbatore: { rainfall: "medium", suitable: ["Cotton", "Turmeric"] },
    Madurai: { rainfall: "low", suitable: ["Millets", "Pulses"] },
    Thanjavur: { rainfall: "high", suitable: ["Paddy"] },
  },
  Kerala: {
    Thiruvananthapuram: { rainfall: "high", suitable: ["Coconut", "Banana"] },
    Kozhikode: { rainfall: "high", suitable: ["Rubber", "Spices"] },
    Ernakulam: { rainfall: "high", suitable: ["Coconut", "Banana"] },
  },
  Punjab: {
    Ludhiana: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Amritsar: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Patiala: { rainfall: "medium", suitable: ["Rice", "Wheat"] },
  },
  Haryana: {
    Gurugram: { rainfall: "low", suitable: ["Bajra", "Mustard"] },
    Hisar: { rainfall: "low", suitable: ["Cotton", "Gram"] },
    Karnal: { rainfall: "medium", suitable: ["Wheat", "Rice"] },
  },
  Jharkhand: {
    Ranchi: { rainfall: "high", suitable: ["Rice", "Pulses"] },
    Dhanbad: { rainfall: "medium", suitable: ["Maize", "Paddy"] },
  },
  Chhattisgarh: {
    Raipur: { rainfall: "medium", suitable: ["Rice", "Maize"] },
    Bilaspur: { rainfall: "medium", suitable: ["Rice", "Soybean"] },
  },
  Assam: {
    Guwahati: { rainfall: "high", suitable: ["Rice", "Tea"] },
    Dibrugarh: { rainfall: "high", suitable: ["Tea", "Rice"] },
  },
  Uttarakhand: {
    Dehradun: { rainfall: "high", suitable: ["Basmati Rice", "Wheat"] },
    Nainital: { rainfall: "high", suitable: ["Fruits", "Vegetables"] },
  },
  "Himachal Pradesh": {
    Shimla: { rainfall: "high", suitable: ["Apples", "Peas"] },
    Mandi: { rainfall: "high", suitable: ["Vegetables", "Maize"] },
  },
  "Jammu & Kashmir": {
    Srinagar: { rainfall: "high", suitable: ["Apples", "Saffron"] },
    Jammu: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
  },
  Goa: {
    "North Goa": { rainfall: "high", suitable: ["Coconut", "Cashew"] },
    "South Goa": { rainfall: "high", suitable: ["Rice", "Spices"] },
  },
  Delhi: {
    "New Delhi": { rainfall: "low", suitable: ["Vegetables", "Mustard"] },
  },
  Tripura: {
    Agartala: { rainfall: "high", suitable: ["Pineapple", "Rice"] },
  },
  Meghalaya: {
    Shillong: { rainfall: "high", suitable: ["Potato", "Turmeric"] },
  },
  Manipur: {
    Imphal: { rainfall: "high", suitable: ["Rice", "Pulses"] },
  },
  Mizoram: {
    Aizawl: { rainfall: "high", suitable: ["Ginger", "Turmeric"] },
  },
  Nagaland: {
    Kohima: { rainfall: "high", suitable: ["Rice", "Maize"] },
  },
  "Arunachal Pradesh": {
    Itanagar: { rainfall: "high", suitable: ["Rice", "Millets"] },
  },
  Sikkim: {
    Gangtok: { rainfall: "high", suitable: ["Cardamom", "Vegetables"] },
  },
  "Andaman & Nicobar": {
    "Port Blair": { rainfall: "high", suitable: ["Coconut", "Spices"] },
  },
  Lakshadweep: {
    Kavaratti: { rainfall: "high", suitable: ["Coconut"] },
  },
};

const STATES = Object.keys(REGION_META);
const DISTRICTS = Object.fromEntries(STATES.map((s) => [s, Object.keys(REGION_META[s])]));

const DEFAULT_CROPS = [
  "rice",
  "wheat",
  "maize",
  "soyabean",
  "groundnut",
  "cotton",
  "sugarcane",
  "pulses",
  "millets",
  "barley",
  "mustard",
  "tea",
  "coffee",
  "rubber",
  "tobacco",
  "jute",
  "potato",
  "onion",
  "tomato",
  "chili",
  "banana",
  "mango",
  "citrus",
  "grapes",
  "apple",
  "sesame",
  "sunflower",
];

const SOILS = ["loam", "sandy", "clay", "silt", "laterite", "peaty", "chalky", "saline"];
const IRRIGATIONS = ["rainfed", "partial", "full"];
const PREFERENCES = ["organic", "chemical", "both"];
const SIZES = ["small", "medium", "large"];

const LABELS = {
  en: {
    title: "AI Advisory",
    subtitle: "Clear, local advice for smallholder farmers",
    state: "State",
    district: "District",
    crop: "Crop",
    soil: "Soil",
    irrigation: "Irrigation",
    preference: "Preference",
    region_size: "Region size",
    language: "Language",
    getAdvisory: "Get Advisory",
    reset: "Reset",
    back: "Back to form",
    advisoryTitle: "Advisory Summary",
  },
  hi: {
    title: "एआई सुझाव",
    subtitle: "छोटे किसानों के लिए साफ़, स्थानीय सलाह",
    state: "राज्य",
    district: "जिला",
    crop: "फसल",
    soil: "मिट्टी",
    irrigation: "सिंचाई",
    preference: "पसंद",
    region_size: "क्षेत्र आकार",
    language: "भाषा",
    getAdvisory: "सलाह लें",
    reset: "रीसेट",
    back: "फॉर्म पर वापस",
    advisoryTitle: "सलाह सारांश",
  },
};

export default function FavorableCrops() {
  const [form, setForm] = useState({
    state: "Maharashtra",
    district: "Pune",
    crop: "soyabean",
    soil_type: "loam",
    irrigation: "partial",
    preference: "both",
    region_size: "small",
    language: "hi",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resp, setResp] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const districtsForState = DISTRICTS[form.state] || [];
    if (!districtsForState.includes(form.district)) {
      setForm((f) => ({ ...f, district: districtsForState[0] || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function submitForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    setResp(null);
    setShowDashboard(false);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/advisory/", form);
      setResp(res.data);
      setShowDashboard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Request failed");
      setShowDashboard(false);
    } finally {
      setLoading(false);
    }
  }

  // chart helpers
  function trendToChartData(arr = []) {
    const labels = arr.map((r) => r.date);
    const data = arr.map((r) => Number(r.modal_price));
    return {
      labels,
      datasets: [
        {
          label: "Modal price (INR)",
          data,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          backgroundColor: "rgba(16,185,129,0.12)",
          borderColor: "rgba(16,185,129,0.95)",
        },
      ],
    };
  }

  function barChartData(arr = []) {
    const labels = arr.map((r) => r.date);
    const data = arr.map((r) => Number(r.modal_price));
    return {
      labels,
      datasets: [
        {
          label: "Price",
          data,
          borderRadius: 8,
          backgroundColor: "rgba(99,102,241,0.9)",
        },
      ],
    };
  }

  function pieChartData(varieties = {}) {
    const labels = Object.keys(varieties);
    const values = labels.map((k) => (Array.isArray(varieties[k]) ? varieties[k].length : 1));
    const colors = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          hoverOffset: 8,
        },
      ],
    };
  }

  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 10, padding: 8 } },
      tooltip: { mode: "index", intersect: false },
    },
    maintainAspectRatio: false,
  };

  const labels = LABELS[form.language || "hi"];

  const advisory = {
    sowing_window: resp?.sowing_window ?? "जून से जुलाई",
    fertilizer:
      resp?.fertilizer_plan?.basal && resp?.fertilizer_plan?.top_dressing
        ? `${resp.fertilizer_plan.basal} / ${resp.fertilizer_plan.top_dressing}`
        : "100 किलोग्राम NPK / 50 किलोग्राम यूरिया",
    water_schedule: resp?.water_schedule ?? "सप्ताह में एक बार, 5-7 सेंटीमीटर पानी",
    organic: resp?.organic_options ?? ["गोबर की खाद", "वर्मी कंपोस्ट"],
    pests:
      resp?.pests?.map((p) => ({
        name: p.name || "—",
        signs: p.early_signs || p.signs || "—",
        treatment: p.safe_treatment || p.treatment || "—",
      })) ?? [{ name: "किड़ा", signs: "पत्तियों पर छिद्र", treatment: "नीम का तेल" }],
  };

  const latestPrice =
    resp?.trend?.recent?.slice(-1)[0]?.modal_price ??
    resp?.synthetic_rows_sample?.slice(-1)[0]?.modal_price ??
    "—";

  /* ---------- FORM (centered, white page, green gradient form) ---------- */
    const CenteredForm = (
    <div className="page-root">
      <div className="form-center">
        <div className="form-card">
          <div className="form-card-head">
            <div>
              <h2 className="form-title">{labels.title}</h2>
              <div className="form-sub">{labels.subtitle}</div>
            </div>

            <div className="form-head-controls">
              <label className="lang-label">
                <FaGlobe style={{ marginRight: 8 }} />
                <select name="language" value={form.language} onChange={handleChange} className="language-select">
                  <option value="hi">हिन्दी</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </div>

          <form onSubmit={submitForm} className="simple-form" aria-label="AI advisory form">
            {/* State */}
            <div className="form-group">
              <div className="label-row">
                <FaMapMarkedAlt className="label-icon" />
                <div className="label-text">{labels.state}</div>
              </div>
              <select name="state" value={form.state} onChange={handleChange} className="input-select">
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="form-group">
              <div className="label-row">
                <FaMapMarkedAlt className="label-icon" />
                <div className="label-text">{labels.district}</div>
              </div>
              <select name="district" value={form.district} onChange={handleChange} className="input-select">
                {(DISTRICTS[form.state] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop */}
            <div className="form-group">
              <div className="label-row">
                <FaCrop className="label-icon" />
                <div className="label-text">{labels.crop}</div>
              </div>
              <select name="crop" value={form.crop} onChange={handleChange} className="input-select">
                {DEFAULT_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil */}
            <div className="form-group">
              <div className="label-row">
                <FaChartBar className="label-icon" />
                <div className="label-text">{labels.soil}</div>
              </div>
              <select name="soil_type" value={form.soil_type} onChange={handleChange} className="input-select">
                {SOILS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Irrigation */}
            <div className="form-group">
              <div className="label-row">
                <FaTint className="label-icon" />
                <div className="label-text">{labels.irrigation}</div>
              </div>
              <select name="irrigation" value={form.irrigation} onChange={handleChange} className="input-select">
                {IRRIGATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Preference */}
            <div className="form-group">
              <div className="label-row">
                <FaLeaf className="label-icon" />
                <div className="label-text">{labels.preference}</div>
              </div>
              <select name="preference" value={form.preference} onChange={handleChange} className="input-select">
                {PREFERENCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Region size */}
            <div className="form-group">
              <div className="label-row">
                <FaMapMarkedAlt className="label-icon" />
                <div className="label-text">{labels.region_size}</div>
              </div>
              <select name="region_size" value={form.region_size} onChange={handleChange} className="input-select">
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading} aria-label="Get Advisory">
                {loading ? `${labels.getAdvisory}...` : (<><FaCheck style={{ marginRight: 8 }} /> {labels.getAdvisory}</>)}
              </button>

              <button
                type="button"
                className="reset-btn"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    state: STATES[0] || "",
                    district: (DISTRICTS[STATES[0]] && DISTRICTS[STATES[0]][0]) || "",
                    crop: DEFAULT_CROPS[0],
                    soil_type: SOILS[0],
                    irrigation: IRRIGATIONS[1],
                    preference: PREFERENCES[2],
                    region_size: SIZES[0],
                  }))
                }
              >
                {labels.reset}
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            {/* small region meta */}
            <div className="region-meta">
              <div>
                <strong>{form.language === "hi" ? "क्षेत्र वर्षा:" : "Region rainfall:"}</strong>{" "}
                {resp?.region_meta?.rainfall ?? (REGION_META[form.state]?.[form.district]?.rainfall) ?? "—"}
              </div>
              <div>
                <strong>{form.language === "hi" ? "उपयुक्त फसलें:" : "Suitable:"}</strong>{" "}
                {(resp?.region_meta?.suitable ?? (REGION_META[form.state]?.[form.district]?.suitable) ?? []).join(", ")}
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* page */
        html, body { background: #ffffff; }
        .page-root { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:32px; }
        .form-center { width:760px; max-width:96%; }

        /* form card */
        .form-card {
          background: linear-gradient(180deg,#e9fff0 0%, #ccf9d8 100%);
          border-radius:14px;
          padding:20px;
          border: 2px solid rgba(4,88,52,0.08);
          box-shadow: 0 14px 36px rgba(6,95,70,0.06);
        }
        .form-card-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
        .form-title { margin:0; font-size:20px; font-weight:800; color:#064e3b; }
        .form-sub { color:#065f46; font-size:0.95rem; opacity:0.95 }

        .form-head-controls { display:flex; align-items:center; gap:10px; }
        .language-select { padding:8px 10px; border-radius:10px; border:1px solid rgba(6,95,70,0.08); font-weight:700; color:#064e3b }

        /* simple stacked form */
        .simple-form { display:flex; flex-direction:column; gap:12px; }
        .form-group { display:flex; flex-direction:column; gap:8px; }
        .label-row { display:flex; align-items:center; gap:10px; }
        .label-icon { background: rgba(6,95,70,0.06); padding:8px; border-radius:8px; color:#064e3b; width:34px; height:34px; display:flex; align-items:center; justify-content:center; }
        .label-text { font-weight:800; color:#064e3b; font-size:1rem; }

        .input-select { padding:12px 14px; border-radius:10px; border:1px solid rgba(2,6,23,0.06); background:#ffffff; font-size:1.05rem; color:#064e3b; box-shadow: inset 0 4px 8px rgba(6,95,70,0.02); }

        .form-actions { display:flex; gap:12px; align-items:center; margin-top:6px; justify-content:center; }
        .submit-btn { background: linear-gradient(90deg,#059669,#10b981); color:#fff; padding:12px 18px; border-radius:12px; border:none; font-weight:900; font-size:1.05rem; box-shadow: 0 10px 26px rgba(16,185,129,0.12); display:flex; align-items:center; }
        .submit-btn:disabled { opacity:0.8 }
        .reset-btn { background:#fff3cd; color:#92400e; border:1px solid rgba(249,115,22,0.12); padding:10px 14px; border-radius:10px; font-weight:800; }

        .form-error { color:#9b1c1c; font-weight:700; text-align:center; margin-top:6px; }

        .region-meta { margin-top:10px; color:#065f46; text-align:center; font-weight:700; }

        @media (max-width:720px) {
          .form-card { padding:14px; }
          .submit-btn { width:100%; justify-content:center; }
          .form-actions { flex-direction:column; gap:8px; }
        }
      `}</style>
    </div>
  );

  /* ---------- DASHBOARD (rendered after submit) ---------- */
  const DashboardView = (
    <div className="dashboard-root p-4" style={{ background: "#ffffff" }}>
      <div className="header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="title" style={{ margin: 0, fontWeight: 800, color: "#064e3b" }}>
            {labels.title} — {form.language === "hi" ? "किसान सलाह" : "Farmer Insights"}
          </h1>
          <p style={{ margin: 0, color: "#065f46" }}>{labels.subtitle}</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select name="language" value={form.language} onChange={(e) => setForm((s) => ({ ...s, language: e.target.value }))} className="language-select">
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={() => setShowDashboard(false)}>{labels.back}</button>
        </div>
      </div>

      <div className="row gx-4 gy-4">
        <div className="col-12">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 8px 22px rgba(6,95,70,0.04)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <FaChartLine />
                  </div>
                  <div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{form.language === "hi" ? "नवीनतम कीमत" : "Latest price"}</div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{latestPrice}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 8px 22px rgba(6,95,70,0.04)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#10b981,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <FaLeaf />
                  </div>
                  <div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{form.language === "hi" ? "उम्मीद सुधार" : "Expected improvement"}</div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{resp?.expected_improvement ?? "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 8px 22px rgba(6,95,70,0.04)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#fb923c,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <FaSeedling />
                  </div>
                  <div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{form.language === "hi" ? "सुझाई गई फसलें" : "Recommended crops"}</div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{resp?.best_crops ? resp.best_crops.join(", ") : "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 8px 22px rgba(6,95,70,0.04)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <FaMapMarkedAlt />
                  </div>
                  <div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{form.language === "hi" ? "क्षेत्र" : "Region"}</div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{form.state} / {form.district}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="row g-3">
            <div className="col-lg-6">
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 12px 30px rgba(6,95,70,0.03)", minHeight: 320 }}>
                <h5 style={{ marginBottom: 12 }}>{form.language === "hi" ? "मूल्य प्रवृत्ति" : "Price Trend"}</h5>
                <div style={{ height: 260 }}>
                  {resp?.trend?.recent ? (
                    <Line data={trendToChartData(resp.trend.recent)} options={chartOpts} />
                  ) : (
                    <div style={{ padding: 36, textAlign: "center", color: "#6b7280" }}>{form.language === "hi" ? "कोई डेटा नहीं" : "No data"}</div>
                  )}
                </div>
                <div style={{ marginTop: 8, color: "#6b7280" }}>{resp?.trend?.text}</div>
              </div>
            </div>

            <div className="col-lg-6">
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 12px 30px rgba(6,95,70,0.03)", minHeight: 320 }}>
                <h5 style={{ marginBottom: 12 }}>{form.language === "hi" ? "मूल्य (बार)" : "Prices (Bar)"}</h5>
                <div style={{ height: 260 }}>
                  {resp?.synthetic_rows_sample ? (
                    <Bar data={barChartData(resp.synthetic_rows_sample)} options={chartOpts} />
                  ) : (
                    <div style={{ padding: 36, textAlign: "center", color: "#6b7280" }}>{form.language === "hi" ? "नमूना पंक्तियाँ नहीं" : "No sample rows"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Advisory summary */}
          <div className="row g-3 mt-3">
            <div className="col-lg-4">
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 12px 30px rgba(6,95,70,0.03)" }}>
                <h5 style={{ marginBottom: 12 }}>{form.language === "hi" ? "प्रजातियाँ वितरण" : "Varieties distribution"}</h5>
                <div style={{ height: 220 }}>
                  {resp?.varieties ? (
                    <Pie data={pieChartData(resp.varieties)} options={{ ...chartOpts, plugins: { legend: { position: "right" } } }} />
                  ) : (
                    <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>{form.language === "hi" ? "कोई डेटा नहीं" : "No variety data"}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 12px 30px rgba(6,95,70,0.03)" }}>
                <h5 style={{ marginBottom: 12 }}>{labels.advisoryTitle}</h5>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#f8fff8", padding: 12, borderRadius: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "linear-gradient(135deg,#a78bfa,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <FaSun />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{form.language === "hi" ? "बुवाई की खिड़की" : "Sowing window"}</div>
                        <div style={{ fontWeight: 700 }}>{advisory.sowing_window}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#fff8f3", padding: 12, borderRadius: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "linear-gradient(135deg,#fb923c,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <FaLeaf />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{form.language === "hi" ? "उर्वरक" : "Fertilizer"}</div>
                        <div style={{ fontWeight: 700 }}>{advisory.fertilizer}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#eef9ff", padding: 12, borderRadius: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <FaWater />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{form.language === "hi" ? "सिंचाई तालिका" : "Water schedule"}</div>
                        <div style={{ fontWeight: 700 }}>{advisory.water_schedule}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#f3f0ff", padding: 12, borderRadius: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <FaSeedling />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{form.language === "hi" ? "ऑर्गेनिक विकल्प" : "Organic"}</div>
                        <div style={{ fontWeight: 700 }}>{(advisory.organic || []).join(", ")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <h6 style={{ marginBottom: 8 }}>{form.language === "hi" ? "कीट और रोग" : "Pests"}</h6>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {(advisory.pests || []).map((p, i) => (
                      <div key={i} style={{ minWidth: 260, background: "#fff", padding: 12, borderRadius: 10, boxShadow: "0 8px 20px rgba(6,95,70,0.02)" }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: i === 0 ? "linear-gradient(135deg,#f97316,#ef4444)" : "linear-gradient(135deg,#8b5cf6,#06b6d4)" }}>
                            <FaBug />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                            <div><strong>{form.language === "hi" ? "लक्षण" : "Signs"}:</strong> {p.signs}</div>
                            <div><strong>{form.language === "hi" ? "उपचार" : "Treatment"}:</strong> {p.treatment}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* keep minimal dashboard styling (white background already set) */
        .language-select { padding:8px 10px; border-radius:8px; border:1px solid rgba(6,95,70,0.08); font-weight:700; color:#064e3b }
        @media (max-width: 820px) {
          .form-center { width: 96%; margin: 0 auto; }
        }
      `}</style>
    </div>
  );

  return <div>{showDashboard ? DashboardView : CenteredForm}</div>;
}
