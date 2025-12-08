import React from 'react'
import { FaStore, FaNewspaper, FaSeedling } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function AIAdvisoryPage() {
  const navigate=useNavigate();

  const buttons = [
      {
        name: "Recommended Crops",
        icon: <FaStore size={32} />,
        path: "/advisory/crop-recommendation",
        color: "#4CAF50",
      },
      {
        name: "Crop Details",
        icon: <FaNewspaper size={32} />,
        path: "/crop-detail",
        color: "#FF9800",
      },
      {
        name: "Crop planning",
        icon: <FaSeedling size={32} />,
        path: "/advisory/plan-crops",
        color: "#8BC34A",
      },
    ];
  return (
    <div className='AI-advisory-page-container'>

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
    </div>
  )
}
