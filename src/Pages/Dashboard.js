import React from "react";
import WeatherWidget from "../Components/Weather-component/WeatherWidget";
import { useNavigate } from "react-router-dom";
import { FaSeedling, FaNewspaper, FaStore, FaChartLine } from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();

  const buttons = [
    {
      name: "Mandi Prices",
      icon: <FaChartLine size={32} />,
      path: "/mandi-prices",
      color: "#4CAF50",
    },
    {
      name: "Market",
      icon: <FaStore size={32} />,
      path: "/market",
      color: "#2196F3",
    },
    {
      name: "News",
      icon: <FaNewspaper size={32} />,
      path: "/news",
      color: "#FF9800",
    },
    {
      name: "Crop Detail",
      icon: <FaSeedling size={32} />,
      path: "/crop-detail",
      color: "#8BC34A",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-weather-widget-container">
      <WeatherWidget />
      </div>
      <div className="dashboard-button-container">
              <style>
          {`
          /* Make all cards equal height */
          .dash-btn-card {
            height: 130px;
            border-radius: 20px;
            cursor: pointer;
            transition: 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dash-btn-card:hover {
            transform: scale(1.06);
          }

          /* Make inner content centered & consistent */
          .dash-btn-body {
            border-radius: 20px;
            padding: 24px 10px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          /* Text and icon alignment */
          .dash-btn-body h6 {
            margin-top: 8px;
            font-weight: 700;
          }
        `}
          </style>

          <div className="container mt-4">
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

      <div className="dashboard-avaialable-plots"></div>
    </div>
  );
}
