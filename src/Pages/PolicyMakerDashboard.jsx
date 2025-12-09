import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSeedling, FaMapMarkedAlt, FaRobot, FaChartLine } from 'react-icons/fa';
import authService from '../services/authService';
import AIAdvisoryBanner from '../Components/Common/AIAdvisoryBanner';
import indiaMap from '../data/indiaMap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Oilseed production by state/UT in lakh tonnes (provided dataset).
const oilseedTonnes = {
  hp: 0.01,
  pb: 0.04,
  hr: 0.12,
  ut: 0.08,
  up: 4.72,
  rj: 36.49,
  gj: 84.46,
  mh: 70.06,
  mp: 61.91,
  br: 0.15,
  wb: 0.1,
  jh: 0.29,
  ct: 0.58,
  or: 0.57,
  tg: 2.56,
  ka: 3.37,
  ap: 1.74,
  tn: 3.92,
  // All other states/UTs not listed are treated as NA/0.
};

// Oilseed mix by state (percent by type, must sum to 100).
const oilseedTypeMix = {
  gj: { Groundnut: 60, Castor: 20, Sesame: 10, Soyabean: 10 },
  rj: { Groundnut: 40, Castor: 10, Rapeseed: 25, Soyabean: 15, Sunflower: 10 },
  mh: { Groundnut: 25, Soyabean: 40, Safflower: 15, Sunflower: 10, Sesame: 10 },
  mp: { Soyabean: 60, Linseed: 10, Rapeseed: 15, Nigerseed: 10, Sesame: 5 },
  ka: { Groundnut: 25, Sunflower: 35, Soyabean: 15, Nigerseed: 10, Sesame: 15 },
  ap: { Groundnut: 35, Sunflower: 35, Castor: 10, Soyabean: 10, Sesame: 10 },
  tg: { Groundnut: 25, Sunflower: 35, Castor: 15, Sesame: 15, Soyabean: 10 },
  up: { Rapeseed: 35, Linseed: 30, Soyabean: 15, Sesame: 10, Sunflower: 10 },
  hr: { Rapeseed: 50, Linseed: 15, Soyabean: 15, Sesame: 10, Sunflower: 10 },
  pb: { Rapeseed: 55, Linseed: 15, Sesame: 10, Soyabean: 10, Sunflower: 10 },
  hp: { Rapeseed: 45, Linseed: 25, Soyabean: 10, Sesame: 10, Sunflower: 10 },
  ut: { Rapeseed: 35, Linseed: 25, Soyabean: 15, Sesame: 10, Sunflower: 15 },
  br: { Linseed: 40, Rapeseed: 30, Nigerseed: 10, Sesame: 10, Sunflower: 10 },
  wb: { Rapeseed: 40, Linseed: 25, Nigerseed: 15, Sesame: 10, Sunflower: 10 },
  jh: { Nigerseed: 25, Sesame: 20, Linseed: 20, Rapeseed: 20, Sunflower: 15 },
  ct: { Nigerseed: 35, Sesame: 25, Sunflower: 15, Soyabean: 15, Linseed: 10 },
  or: { Nigerseed: 45, Sesame: 25, Sunflower: 10, Linseed: 10, Soyabean: 10 },
  tn: { Groundnut: 25, Sunflower: 25, Sesame: 20, Soyabean: 15, Castor: 15 },
};

const clampTo100 = (value = 0) => Math.max(0, Math.min(100, value));

const getFillColor = (value) => {
  const pct = clampTo100(value) / 100; // upper bound locked at 100%
  const start = [232, 245, 233]; // light green
  const end = [12, 104, 65]; // deep green
  const channel = start.map((s, i) => Math.round(s + (end[i] - s) * pct));
  return `rgb(${channel[0]}, ${channel[1]}, ${channel[2]})`;
};

const IndiaOilseedHeatmap = () => {
  const [selectedStateId, setSelectedStateId] = useState(null);

  const totalTonnes = useMemo(
    () => Object.values(oilseedTonnes).reduce((sum, val) => sum + val, 0),
    []
  );

  const states = useMemo(
    () =>
      indiaMap.locations.map((loc) => ({
        ...loc,
        tonnes: oilseedTonnes[loc.id] ?? 0,
        percent: totalTonnes ? clampTo100(((oilseedTonnes[loc.id] ?? 0) / totalTonnes) * 100) : 0,
      })),
    [totalTonnes]
  );

  const selectedState = useMemo(
    () => states.find((state) => state.id === selectedStateId) || null,
    [selectedStateId, states]
  );

  const defaultState = useMemo(
    () => states.reduce((acc, curr) => (curr.percent > (acc?.percent ?? -1) ? curr : acc), null),
    [states]
  );

  const displayState = selectedState || defaultState;

  const pieData = useMemo(() => {
    const mix = displayState ? oilseedTypeMix[displayState.id] : null;
    if (!mix) return null;
    const labels = Object.keys(mix);
    const values = labels.map((key) => mix[key]);
    const palette = [
      '#6f4e37', // groundnut
      '#c4a000', // castor
      '#0047ab', // linseed
      '#0f4c5c', // nigerseed
      '#8c52ff', // rapeseed
      '#ff8c42', // safflower
      '#7d6b55', // sesame
      '#2eb872', // soyabean
      '#ff1f8f', // sunflower
    ];
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, idx) => palette[idx % palette.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [displayState]);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex flex-column flex-xl-row gap-3 align-items-start">
          <div style={{ minWidth: '260px' }} className="w-100" aria-live="polite">
            <h5 className="card-title text-success mb-2">Welcome Policy Maker</h5>
            <p className="text-muted small mb-3">
              Political map of India heatmap using provided oilseed production (lakh tonnes). Values
              are normalized to percent of the dataset (upper bound fixed at 100%).
            </p>
            <div className="border rounded-3 p-3 bg-light">
              <div className="fw-semibold">{displayState?.name || 'Select a state'}</div>
              <div className="text-muted small">Oilseed production share (of dataset)</div>
              <div className="fs-3 fw-bold text-success mb-1">{(displayState?.percent ?? 0).toFixed(1)}%</div>
              <div className="text-muted small">
                From {(displayState?.tonnes ?? 0).toFixed(2)} lakh tonnes - Total dataset: {totalTonnes.toFixed(2)} lakh tonnes
              </div>
              <div className="small text-muted">Upper bound: 100% - Click the map to update</div>
            </div>
            <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
              <span
                className="rounded-2"
                style={{ width: 32, height: 12, background: 'rgb(232, 245, 233)' }}
                aria-hidden="true"
              ></span>
              <small className="text-muted">0%</small>
              <div
                className="flex-grow-1"
                style={{
                  height: 8,
                  minWidth: '120px',
                  background: 'linear-gradient(90deg, rgb(232, 245, 233), rgb(12, 104, 65))',
                  borderRadius: '999px',
                }}
                aria-hidden="true"
              ></div>
              <small className="text-muted">100%</small>
            </div>
          </div>

          <div className="flex-grow-1 w-100">
            <div
              className="border rounded-3 bg-white position-relative"
              style={{ minHeight: '320px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ width: '100%', height: '100%', aspectRatio: '3 / 3.5' }}
              >
                <svg
                  viewBox={indiaMap.viewBox}
                  role="img"
                  aria-label="India oilseed production heatmap"
                  style={{ width: '100%', height: '100%' }}
                >
                  <title>India oilseed production heatmap</title>
                  {states.map((state) => {
                    const isActive = state.id === selectedStateId;
                    const fill = getFillColor(state.percent);
                    return (
                      <path
                        key={state.id}
                        d={state.path}
                        fill={fill}
                        stroke={isActive ? '#0f5132' : '#a4d4ae'}
                        strokeWidth={isActive ? 1.6 : 0.8}
                        opacity={0.95}
                        style={{
                          cursor: 'pointer',
                          transition: 'fill 0.2s ease, stroke 0.2s ease, transform 0.2s ease',
                          transform: isActive ? 'scale(1.005)' : undefined,
                        }}
                        onClick={() => setSelectedStateId(state.id)}
                      >
                        <title>{`${state.name}: ${state.tonnes.toFixed(2)} lakh tonnes (${state.percent.toFixed(2)}%)`}</title>
                      </path>
                    );
                  })}
                </svg>
              </div>
              <div className="position-absolute bottom-0 end-0 m-2 px-3 py-1 bg-white bg-opacity-75 rounded-pill shadow-sm small text-muted">
                Responsive heatmap - resize or pinch/zoom to explore
              </div>
            </div>
          </div>

          <div className="flex-grow-1 w-100">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title mb-3">Oilseed mix</h6>
                {pieData ? (
                  <Pie
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    style={{ maxHeight: '360px' }}
                  />
                ) : (
                  <div className="text-muted">No crop mix data for this state.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PolicyMakerDashboard = () => {
  const user = authService.getStoredUser();
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <AIAdvisoryBanner />
      {/* Header with Kisan Portal gradient styling */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          borderRadius: '12px',
          padding: '30px',
          color: 'white',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h2 className="mb-2">Welcome, {user?.name || 'Policy Maker'}!</h2>
        <p className="lead mb-0">Role: Policy Maker</p>
      </div>

      {/* Featured Tools */}
      <div className="row mb-4">
        <div className="col-12">
          <h5 className="mb-3">Policy Planning Tools</h5>
        </div>

        {/* Palm Oil Cluster Planner - Featured Card */}
        <div className="col-md-6 mb-3">
          <div
            className="card shadow-sm h-100 border-success"
            style={{ borderWidth: '2px', cursor: 'pointer' }}
            onClick={() => navigate('/palm-oil-cluster-planner')}
          >
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div
                  className="rounded-circle bg-success bg-opacity-10 p-3 me-3"
                  style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaSeedling size={28} className="text-success" />
                </div>
                <div className="flex-grow-1">
                  <h5 className="card-title text-success mb-1">
                    Palm Oil Cluster Planner
                    <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>NEW</span>
                  </h5>
                  <p className="text-muted small mb-0">National Oilseed Mission</p>
                </div>
              </div>

              <p className="card-text mb-3">
                AI-powered cluster planning tool for palm oil cultivation under the National Oilseed Mission.
                Analyze states, identify optimal cluster locations, and generate policy recommendations with ChatGPT-4.
              </p>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-success bg-opacity-10 text-success">
                  <FaMapMarkedAlt className="me-1" />
                  India Map Visualization
                </span>
                <span className="badge bg-info bg-opacity-10 text-info">
                  <FaChartLine className="me-1" />
                  Satellite Data Analysis
                </span>
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  <FaRobot className="me-1" />
                  ChatGPT-4 Integration
                </span>
              </div>

              <button className="btn btn-success w-100">
                Launch Cluster Planner
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <h5 className="card-title text-muted">
                <i className="bi bi-clipboard-data me-2"></i>
                Analytics Dashboard
                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>COMING SOON</span>
              </h5>
              <p className="card-text text-muted">
                Comprehensive analytics and monitoring tools for policy decisions:
              </p>
              <ul className="text-muted">
                <li>Monitor system-wide stakeholder metrics</li>
                <li>Track aggregate production volumes and trends</li>
                <li>Analyze market price indices and compliance rates</li>
                <li>Generate reports for policy decisions and regulations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyMakerDashboard;
