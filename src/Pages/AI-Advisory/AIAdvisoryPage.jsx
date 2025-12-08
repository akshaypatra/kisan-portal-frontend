import React from "react";
import {
  FaStore,
  FaNewspaper,
  FaSeedling,
  FaTractor,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AIAdvisoryPage() {
  const navigate = useNavigate();

  const buttons = [
    {
      key: "recommended-crops",
      name: "Recommended Crops",
      subtitle: "Smart crop selection",
      icon: <FaStore size={30} />,
      path: "/advisory/crop-recommendation",
      color: "linear-gradient(135deg, #22c55e, #16a34a)",
      accent: "#22c55e",
      descColor: "rgba(34,197,94,0.12)",
      description:
        "AI suggests top crops based on climate, region, season and demand.",
      bullets: [
        "Uses weather & region data",
        "Demand & price forecast",
        "Max-profit suggestions",
      ],
    },
    {
      key: "crop-details",
      name: "Crop Details",
      subtitle: "Deep crop insights",
      icon: <FaNewspaper size={30} />,
      path: "/crop-detail",
      color: "linear-gradient(135deg, #f97316, #fb923c)",
      accent: "#f97316",
      descColor: "rgba(249,115,22,0.12)",
      description: "Guides on irrigation, fertilizer, pests & best practices.",
      bullets: [
        "Sowing & harvesting guide",
        "Irrigation plan",
        "Pest & disease control",
      ],
    },
    {
      key: "crop-planning",
      name: "Crop Planning",
      subtitle: "Intercrop strategies",
      icon: <FaSeedling size={30} />,
      path: "/advisory/plan-crops",
      color: "linear-gradient(135deg, #22c55e, #22d3ee)",
      accent: "#14b8a6",
      descColor: "rgba(34,211,238,0.12)",
      description:
        "Plan primary + secondary crops with income projection & area split.",
      bullets: [
        "AI ratio planning",
        "Income comparison",
        "Multi-season smart planning",
      ],
    },
    {
      key: "oilseed-planning",
      name: "Oilseed Planning",
      subtitle: "Specialized oilseed advisory",
      icon: <FaTractor size={30} />,
      path: "/advisory/plan-oil-seeds",
      color: "linear-gradient(135deg, #facc15, #f59e0b)",
      accent: "#f59e0b",
      descColor: "rgba(250,204,21,0.13)",
      description:
        "Optimized oilseed suggestions using climate, NPK & pH data.",
      bullets: [
        "Oilseed-specific AI",
        "Schemes & subsidies",
        "Climate-driven advice",
      ],
    },
  ];

  return (
    <div className="AI-advisory-page-container">
      <style>{`
        .AI-advisory-page-container {
          min-height: 100vh;
          padding: 24px 0 40px;
          background:
            radial-gradient(circle at 0% 0%, #bbf7d0 0, transparent 45%),
            radial-gradient(circle at 100% 0%, #fed7aa 0, transparent 45%),
            radial-gradient(circle at 100% 100%, #bfdbfe 0, transparent 45%),
            linear-gradient(180deg, #ecfeff 0%, #fefce8 50%, #ecfdf5 100%);
        }

        .ai-hero-wrapper { max-width: 1140px; margin: 0 auto; padding: 0 16px; }

        /* EQUAL BUTTON HEIGHT */
        .dash-btn-card {
          height: 150px;
          border-radius: 20px;
          cursor: pointer;
          transition: transform .25s, box-shadow .25s;
          display: flex;
          align-items: stretch;
          background: transparent;
          border: none;
        }
        .dash-btn-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .dash-btn-body {
          border-radius: 20px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .dash-btn-body:before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 60%);
        }

        .dash-btn-title { font-weight: 800; font-size: 19px; }
        .dash-btn-subtitle {  font-size: 15px; opacity: 0.9; }

        .dash-btn-footer {
          display: flex;
          gap: 6px;
          font-size: 11px;
          opacity: 0.95;
        }

        .chip-pill {
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.15);
          font-size: 15px;
        }

        /* FEATURE CARDS WITH SUBTLE COLOR BACKGROUND */
        .feature-card {
          border-radius: 16px;
          padding: 14px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(148,163,184,0.25);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .feature-description-box {
          padding: 10px;
          border-radius: 12px;
          font-size: 15px;
          margin-bottom: 8px;
        }

        .feature-badge {
          font-size: 13px;
          border-radius: 999px;
          padding: 4px 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        /* RESPONSIVE BUTTONS */
        @media (max-width: 575px) {
          .dash-btn-card { height: 130px; }
          .dashboard-button-container .col-6 { max-width: 100%; flex: 0 0 100%; }
        }
      `}</style>

      <div className="ai-hero-wrapper">
        {/* -------------- HERO SECTION -------------- */}
        <div
          className="p-3 mb-3"
          style={{
            borderRadius: "20px",
            background: "linear-gradient(135deg, #ffffffcc, #f0fdf4dd)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          }}
        >
          <h2 className="fw-bold text-success mb-1">
            🌾 AI Advisory – Smarter Farming Starts Here
          </h2>
          <p className="text-muted mb-0">
            Choose the best crops, explore crop guides, plan field layouts,
            or get dedicated oilseed advisory.
          </p>
        </div>

        {/* ---------- MAIN BUTTON GRID (EQUAL SIZE BUTTONS) ---------- */}
        <div className="dashboard-button-container">
          <div className="row g-3">
            {buttons.map((btn) => (
              <div key={btn.key} className="col-6 col-md-3 d-flex">
                <div className="dash-btn-card w-100" onClick={() => navigate(btn.path)}>
                  <div className="dash-btn-body" style={{ background: btn.color }}>
                    <div>
                      <h6 className="dash-btn-title">{btn.name}</h6>
                      <div className="dash-btn-subtitle">{btn.subtitle}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="chip-pill">AI Assisted</div>
                      {btn.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- COLOURFUL DESCRIPTION CARDS ------------- */}
        <div className="mt-4">
          <h5 className="fw-semibold mb-2">✨ What each module helps you do</h5>

          <div className="row g-3">
            {buttons.map((btn) => (
              <div key={btn.key + "-feature"} className="col-md-6">
                <div className="feature-card">
                  <div
                    className="feature-description-box"
                    style={{ background: btn.descColor }}
                  >
                    <strong>{btn.name}</strong> – {btn.description}
                  </div>

                  {btn.bullets.map((b, i) => (
                    <span key={i} className="feature-badge me-2 mb-2 d-inline-block">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
