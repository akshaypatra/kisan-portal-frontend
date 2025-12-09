import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import {
  FaMapMarkedAlt, FaChartBar, FaSeedling, FaIndustry, FaRoad,
  FaUsers, FaCloudRain, FaThermometerHalf, FaLeaf, FaRobot,
  FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaFileDownload
} from 'react-icons/fa';
import palmOilClusterService from '../services/palmOilClusterService';
import CONFIG from '../config';

const GOOGLE_LIBRARIES = ['places'];

// Sample state data with coordinates (this would come from backend)
const INDIA_STATES_DATA = [
  { code: 'andhra_pradesh', name: 'Andhra Pradesh', lat: 15.9129, lng: 79.7400, color: '#28a745' },
  { code: 'telangana', name: 'Telangana', lat: 17.1232, lng: 79.2088, color: '#28a745' },
  { code: 'karnataka', name: 'Karnataka', lat: 15.3173, lng: 75.7139, color: '#28a745' },
  { code: 'tamil_nadu', name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, color: '#28a745' },
  { code: 'kerala', name: 'Kerala', lat: 10.8505, lng: 76.2711, color: '#20c997' },
  { code: 'odisha', name: 'Odisha', lat: 20.9517, lng: 85.0985, color: '#28a745' },
  { code: 'assam', name: 'Assam', lat: 26.2006, lng: 92.9376, color: '#20c997' },
  { code: 'nagaland', name: 'Nagaland', lat: 26.1584, lng: 94.5624, color: '#ffc107' },
  { code: 'manipur', name: 'Manipur', lat: 24.6637, lng: 93.9063, color: '#ffc107' },
  { code: 'mizoram', name: 'Mizoram', lat: 23.1645, lng: 92.9376, color: '#ffc107' },
  { code: 'tripura', name: 'Tripura', lat: 23.9408, lng: 91.9882, color: '#ffc107' },
  { code: 'arunachal_pradesh', name: 'Arunachal Pradesh', lat: 28.2180, lng: 94.7278, color: '#ffc107' },
  { code: 'meghalaya', name: 'Meghalaya', lat: 25.4670, lng: 91.3662, color: '#ffc107' },
  { code: 'goa', name: 'Goa', lat: 15.2993, lng: 74.1240, color: '#17a2b8' },
  { code: 'gujarat', name: 'Gujarat', lat: 22.2587, lng: 71.1924, color: '#17a2b8' },
  { code: 'maharashtra', name: 'Maharashtra', lat: 19.7515, lng: 75.7139, color: '#17a2b8' },
  { code: 'west_bengal', name: 'West Bengal', lat: 22.9868, lng: 87.8550, color: '#28a745' },
  { code: 'andaman_nicobar', name: 'Andaman & Nicobar', lat: 11.7401, lng: 92.6586, color: '#20c997' },
];

export default function PalmOilClusterPlanner() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | state-analysis | cluster-details
  const [stats, setStats] = useState(null);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedStateData, setSelectedStateData] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [policyAdvisory, setPolicyAdvisory] = useState(null);
  const [generatingAdvisory, setGeneratingAdvisory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [hoveredState, setHoveredState] = useState(null);

  // Load Google Maps API once for the entire component
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: 'palm-oil-cluster-planner-map',
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, statesRes] = await Promise.all([
        palmOilClusterService.getDashboardStats(),
        palmOilClusterService.getStates()
      ]);
      setStats(statsRes.data);
      setStates(statesRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
    setLoading(false);
  };

  const handleStateSelect = async (stateCode) => {
    const stateInfo = states.find(s => s.state_code === stateCode);
    if (!stateInfo) {
      console.error('State not found in database');
      return;
    }

    setSelectedState(stateCode);
    setSelectedStateData(stateInfo);
    setCurrentView('state-analysis');

    // Fetch clusters for this state
    try {
      const res = await palmOilClusterService.getStateClusters(stateInfo.id);
      setClusters(res.data || []);

      // Center map on state
      const stateGeo = INDIA_STATES_DATA.find(s => s.code === stateCode);
      if (stateGeo) {
        setMapCenter({ lat: stateGeo.lat, lng: stateGeo.lng });
        setMapZoom(7);
      }
    } catch (err) {
      console.error('Failed to fetch clusters:', err);
      setClusters([]);
    }
  };

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster);
    setCurrentView('cluster-details');
    setMapCenter({ lat: cluster.latitude, lng: cluster.longitude });
    setMapZoom(10);
  };

  const handleGenerateAdvisory = async () => {
    if (!selectedCluster) return;

    setGeneratingAdvisory(true);
    try {
      const res = await palmOilClusterService.generatePolicyAdvisory(selectedCluster.id);
      setPolicyAdvisory(res.data);
    } catch (err) {
      console.error('Failed to generate advisory:', err);
      alert('Failed to generate policy advisory. Please try again.');
    }
    setGeneratingAdvisory(false);
  };

  const resetToMissionView = () => {
    setCurrentView('dashboard');
    setSelectedState(null);
    setSelectedStateData(null);
    setClusters([]);
    setSelectedCluster(null);
    setPolicyAdvisory(null);
    setMapCenter({ lat: 20.5937, lng: 78.9629 });
    setMapZoom(5);
  };

  if (loading || !mapsLoaded) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Palm Oil Cluster Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FaSeedling className="text-success me-2" />
                Palm Oil Cluster Planner
              </h2>
              <p className="text-muted mb-0">National Oilseed Mission - Edible Oils & Oil Palm Program</p>
            </div>
            {currentView !== 'dashboard' && (
              <button className="btn btn-outline-secondary" onClick={resetToMissionView}>
                <FaArrowRight className="me-2" style={{ transform: 'rotate(180deg)' }} />
                Back to Mission Overview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <>
          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total States</h6>
                      <h3 className="mb-0">{stats?.total_states || 0}</h3>
                    </div>
                    <FaMapMarkedAlt className="text-success" size={40} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Available Land</h6>
                      <h3 className="mb-0">{(stats?.total_available_land_ha / 1000).toFixed(0)}K ha</h3>
                    </div>
                    <FaLeaf className="text-info" size={40} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Existing Palm Area</h6>
                      <h3 className="mb-0">{(stats?.total_existing_palm_area_ha / 1000).toFixed(0)}K ha</h3>
                    </div>
                    <FaSeedling className="text-success" size={40} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Expansion Potential</h6>
                      <h3 className="mb-0">{(stats?.total_potential_expansion_ha / 1000).toFixed(0)}K ha</h3>
                    </div>
                    <FaChartBar className="text-warning" size={40} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Info */}
          <div className="row">
            <div className="col-md-8">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <FaMapMarkedAlt className="me-2" />
                    National Oilseed Mission States - Palm Oil Program
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div style={{ height: '500px' }}>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={mapZoom}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    >
                      {INDIA_STATES_DATA.map((state) => (
                        <Marker
                          key={state.code}
                          position={{ lat: state.lat, lng: state.lng }}
                          title={state.name}
                          onClick={() => handleStateSelect(state.code)}
                          onMouseOver={() => setHoveredState(state)}
                          onMouseOut={() => setHoveredState(null)}
                          icon={{
                            url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${state.color}" stroke="white" stroke-width="2"/></svg>`)}`
                          }}
                        />
                      ))}
                      {hoveredState && (
                        <InfoWindow
                          position={{ lat: hoveredState.lat, lng: hoveredState.lng }}
                          onCloseClick={() => setHoveredState(null)}
                        >
                          <div>
                            <strong>{hoveredState.name}</strong>
                            <br />
                            <small>Click to view cluster analysis</small>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Select State for Analysis</h5>
                </div>
                <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <div className="list-group">
                    {INDIA_STATES_DATA.map((state) => (
                      <button
                        key={state.code}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => handleStateSelect(state.code)}
                      >
                        <span>
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: state.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}
                          ></span>
                          {state.name}
                        </span>
                        <FaArrowRight className="text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0">Legend</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <span className="badge bg-success me-2"></span>
                    <small>High Priority States</small>
                  </div>
                  <div className="mb-2">
                    <span className="badge" style={{ backgroundColor: '#20c997' }}></span>
                    <small className="ms-2">Moderate Priority</small>
                  </div>
                  <div className="mb-2">
                    <span className="badge bg-warning me-2"></span>
                    <small>Emerging Regions</small>
                  </div>
                  <div>
                    <span className="badge bg-info me-2"></span>
                    <small>Under Assessment</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* State Analysis View */}
      {currentView === 'state-analysis' && selectedStateData && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-success text-white">
                  <h4 className="mb-0">{selectedStateData.state_name} - Cluster Analysis</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-light rounded">
                        <FaLeaf size={30} className="text-success mb-2" />
                        <h5>{selectedStateData.total_available_land.toFixed(0)} ha</h5>
                        <small className="text-muted">Available Land</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-light rounded">
                        <FaThermometerHalf size={30} className="text-danger mb-2" />
                        <h5>{selectedStateData.avg_temperature_min}-{selectedStateData.avg_temperature_max}°C</h5>
                        <small className="text-muted">Temperature Range</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-light rounded">
                        <FaCloudRain size={30} className="text-info mb-2" />
                        <h5>{selectedStateData.avg_rainfall} mm</h5>
                        <small className="text-muted">Annual Rainfall</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-light rounded">
                        <FaRoad size={30} className="text-warning mb-2" />
                        <h5>{selectedStateData.connectivity_index}/100</h5>
                        <small className="text-muted">Connectivity Index</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cluster Recommendations */}
          <div className="row">
            <div className="col-md-7">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">
                    <FaMapMarkedAlt className="me-2" />
                    Top 5 Recommended Cluster Locations
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div style={{ height: '600px' }}>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={mapZoom}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    >
                      {clusters.map((cluster) => (
                        <React.Fragment key={cluster.id}>
                          <Marker
                            position={{ lat: cluster.latitude, lng: cluster.longitude }}
                            label={{
                              text: String(cluster.rank),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                            onClick={() => handleClusterSelect(cluster)}
                          />
                          <Circle
                            center={{ lat: cluster.latitude, lng: cluster.longitude }}
                            radius={cluster.radius_km * 1000}
                            options={{
                              fillColor: cluster.rank === 1 ? '#28a745' : cluster.rank === 2 ? '#20c997' : '#ffc107',
                              fillOpacity: 0.2,
                              strokeColor: cluster.rank === 1 ? '#28a745' : cluster.rank === 2 ? '#20c997' : '#ffc107',
                              strokeWeight: 2,
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </GoogleMap>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Cluster Rankings</h5>
                </div>
                <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {clusters.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <FaExclamationTriangle size={40} className="mb-3" />
                      <p>No cluster recommendations available for this state yet.</p>
                    </div>
                  ) : (
                    clusters.map((cluster) => (
                      <div
                        key={cluster.id}
                        className={`card mb-3 border-${cluster.rank === 1 ? 'success' : cluster.rank === 2 ? 'info' : 'warning'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClusterSelect(cluster)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              <span className={`badge bg-${cluster.rank === 1 ? 'success' : cluster.rank === 2 ? 'info' : 'warning'} me-2`}>
                                #{cluster.rank}
                              </span>
                              {cluster.location_name}
                            </h6>
                            <span className="badge bg-primary">{cluster.overall_score}/100</span>
                          </div>
                          <p className="text-muted small mb-2">{cluster.district} District</p>

                          <div className="row g-2 small">
                            <div className="col-6">
                              <FaLeaf className="text-success me-1" />
                              NDVI: {cluster.vegetation_index.toFixed(2)}
                            </div>
                            <div className="col-6">
                              <FaThermometerHalf className="text-danger me-1" />
                              {cluster.avg_temperature}°C
                            </div>
                            <div className="col-6">
                              <FaCloudRain className="text-info me-1" />
                              {cluster.annual_rainfall}mm
                            </div>
                            <div className="col-6">
                              <FaUsers className="text-warning me-1" />
                              {cluster.estimated_farmers} farmers
                            </div>
                          </div>

                          <div className="mt-2">
                            <small className="text-muted">
                              {cluster.available_land_hectares}ha • {cluster.estimated_annual_yield_tons}t yield
                            </small>
                          </div>

                          <button className="btn btn-sm btn-outline-success mt-2 w-100">
                            View AI Advisory <FaRobot className="ms-1" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cluster Details & Policy Advisory View */}
      {currentView === 'cluster-details' && selectedCluster && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-success" style={{ borderWidth: '3px' }}>
                <div className="card-header bg-success text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                      <span className="badge bg-white text-success me-2">#{selectedCluster.rank}</span>
                      {selectedCluster.location_name}, {selectedCluster.district}
                    </h4>
                    <h3 className="mb-0">{selectedCluster.overall_score}/100</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <h6 className="text-muted">Vegetation Index (NDVI)</h6>
                      <div className="progress" style={{ height: '25px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${selectedCluster.vegetation_index * 100}%` }}
                        >
                          {selectedCluster.vegetation_index.toFixed(2)}
                        </div>
                      </div>
                      <small className="text-muted">Optimal: 0.6-0.9</small>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Temperature</h6>
                      <div className="d-flex align-items-center">
                        <FaThermometerHalf size={30} className="text-danger me-2" />
                        <div>
                          <h4 className="mb-0">{selectedCluster.avg_temperature}°C</h4>
                          <small className="text-muted">Optimal: 24-28°C</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Annual Rainfall</h6>
                      <div className="d-flex align-items-center">
                        <FaCloudRain size={30} className="text-info me-2" />
                        <div>
                          <h4 className="mb-0">{selectedCluster.annual_rainfall}mm</h4>
                          <small className="text-muted">Optimal: 2000-3000mm</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Connectivity</h6>
                      <div className="progress" style={{ height: '25px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{ width: `${selectedCluster.connectivity_score}%` }}
                        >
                          {selectedCluster.connectivity_score}/100
                        </div>
                      </div>
                      <small className="text-muted">Road & Transport</small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body">
                          <h6 className="text-success mb-3">
                            <FaCheckCircle className="me-2" />
                            Key Strengths
                          </h6>
                          <ul className="mb-0">
                            {selectedCluster.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body">
                          <h6 className="text-warning mb-3">
                            <FaExclamationTriangle className="me-2" />
                            Challenges
                          </h6>
                          <ul className="mb-0">
                            {selectedCluster.challenges.map((challenge, idx) => (
                              <li key={idx}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <h5 className="text-success mb-1">{selectedCluster.available_land_hectares} ha</h5>
                        <small>Available Land</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                        <h5 className="text-info mb-1">{selectedCluster.estimated_farmers}</h5>
                        <small>Estimated Farmers</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <h5 className="text-warning mb-1">{selectedCluster.estimated_annual_yield_tons}t</h5>
                        <small>Annual Yield</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                        <h5 className="text-primary mb-1">₹{selectedCluster.estimated_annual_revenue_cr} Cr</h5>
                        <small>Annual Revenue</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ChatGPT Policy Advisory */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <h5 className="mb-0 text-white">
                    <FaRobot className="me-2" />
                    AI-Powered Policy Advisory (ChatGPT-4)
                  </h5>
                </div>
                <div className="card-body">
                  {!policyAdvisory ? (
                    <div className="text-center py-5">
                      <FaRobot size={60} className="text-muted mb-3" />
                      <h5>Generate AI-Powered Policy Recommendations</h5>
                      <p className="text-muted">
                        Get comprehensive policy insights, implementation strategies, and economic projections
                        generated by ChatGPT-4 based on cluster data and best practices.
                      </p>
                      <button
                        className="btn btn-lg btn-primary"
                        onClick={handleGenerateAdvisory}
                        disabled={generatingAdvisory}
                      >
                        {generatingAdvisory ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Generating Advisory...
                          </>
                        ) : (
                          <>
                            <FaRobot className="me-2" />
                            Generate Policy Advisory
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Executive Summary */}
                      <div className="mb-4 p-4 bg-light rounded">
                        <h5 className="text-primary mb-3">Executive Summary</h5>
                        <p className="lead">{policyAdvisory.executive_summary}</p>
                      </div>

                      {/* Economic Projections */}
                      <div className="row mb-4">
                        <div className="col-md-3">
                          <div className="card border-primary">
                            <div className="card-body text-center">
                              <h6 className="text-muted">Investment Required</h6>
                              <h4 className="text-primary">₹{policyAdvisory.projected_investment_cr} Cr</h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card border-success">
                            <div className="card-body text-center">
                              <h6 className="text-muted">Employment</h6>
                              <h4 className="text-success">{policyAdvisory.projected_employment.toLocaleString()}</h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card border-info">
                            <div className="card-body text-center">
                              <h6 className="text-muted">5-Year Revenue</h6>
                              <h4 className="text-info">₹{policyAdvisory.projected_revenue_5yr_cr} Cr</h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card border-warning">
                            <div className="card-body text-center">
                              <h6 className="text-muted">ROI</h6>
                              <h4 className="text-warning">{policyAdvisory.roi_percentage}%</h4>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="mb-4">
                        <h5 className="text-primary mb-3">Detailed Analysis</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{policyAdvisory.detailed_analysis}</p>
                      </div>

                      {/* Policy Recommendations */}
                      <div className="mb-4">
                        <h5 className="text-primary mb-3">Policy Recommendations</h5>
                        <div className="list-group">
                          {policyAdvisory.policy_recommendations.map((rec, idx) => (
                            <div key={idx} className="list-group-item">
                              <FaCheckCircle className="text-success me-2" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Implementation Steps */}
                      <div className="mb-4">
                        <h5 className="text-primary mb-3">Implementation Roadmap</h5>
                        <div className="timeline">
                          {policyAdvisory.implementation_steps.map((step, idx) => (
                            <div key={idx} className="mb-3 d-flex">
                              <div className="me-3">
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  {idx + 1}
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="card">
                                  <div className="card-body">
                                    {step}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comparative Analysis */}
                      <div className="mb-4">
                        <h5 className="text-primary mb-3">Comparative Analysis</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{policyAdvisory.comparative_analysis}</p>
                      </div>

                      {/* Risk Assessment */}
                      <div className="mb-4">
                        <h5 className="text-primary mb-3">Risk Assessment & Mitigation</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{policyAdvisory.risk_assessment}</p>
                      </div>

                      {/* Actions */}
                      <div className="text-center">
                        <button className="btn btn-success btn-lg me-2">
                          <FaFileDownload className="me-2" />
                          Download Report (PDF)
                        </button>
                        <button className="btn btn-outline-primary btn-lg" onClick={handleGenerateAdvisory}>
                          <FaRobot className="me-2" />
                          Regenerate Advisory
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
