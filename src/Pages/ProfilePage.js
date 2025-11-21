import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: '',
    regionState: '',
    landArea: '',
    aadhaarNumber: '',
    cropPreferences: [],
    location: { latitude: null, longitude: null }
  });

  // Plot cards state
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state for editing plots
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [editPlotData, setEditPlotData] = useState({});

  // Available crops
  const availableCrops = [
    'Soybean', 'Mustard', 'Groundnut', 'Sesame', 
    'Sunflower', 'Safflower', 'Niger', 'Linseed'
  ];

  // Fetch profile and plots on mount
  useEffect(() => {
    fetchProfile();
    fetchPlots();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('farmer_token');
      const farmer_id = localStorage.getItem('farmer_id');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`https://your-api-domain.com/api/profile/${farmer_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  };

  const fetchPlots = async () => {
    try {
      const token = localStorage.getItem('farmer_token');
      const farmer_id = localStorage.getItem('farmer_id');

      const response = await axios.get(`https://your-api-domain.com/api/plots/${farmer_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlots(response.data.plots || []);
    } catch (err) {
      console.error('Error fetching plots:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleCropToggle = (crop) => {
    setProfileData(prev => ({
      ...prev,
      cropPreferences: prev.cropPreferences.includes(crop)
        ? prev.cropPreferences.filter(c => c !== crop)
        : [...prev.cropPreferences, crop]
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfileData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        setSuccess('Location captured successfully!');
        setLoading(false);
      },
      (error) => {
        setError('Failed to get location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('farmer_token');
      const farmer_id = localStorage.getItem('farmer_id');

      await axios.put(
        `https://your-api-domain.com/api/profile/${farmer_id}`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for plots
  const handleDeletePlot = async (plotId) => {
    if (!window.confirm('Are you sure you want to delete this plot?')) return;

    try {
      const token = localStorage.getItem('farmer_token');
      
      await axios.delete(`https://your-api-domain.com/api/plots/${plotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlots(plots.filter(p => p.id !== plotId));
      setSuccess('Plot deleted successfully!');
    } catch (err) {
      setError('Failed to delete plot');
    }
  };

  const handleEditPlot = (plot) => {
    setSelectedPlot(plot);
    setEditPlotData({
      plotName: plot.plotName,
      description: plot.description,
      userProvidedArea: plot.userProvidedArea
    });
    setShowEditModal(true);
  };

  const handleUpdatePlot = async () => {
    try {
      const token = localStorage.getItem('farmer_token');
      
      await axios.put(
        `https://your-api-domain.com/api/plots/${selectedPlot.id}`,
        editPlotData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setPlots(plots.map(p => 
        p.id === selectedPlot.id 
          ? { ...p, ...editPlotData }
          : p
      ));

      setShowEditModal(false);
      setSuccess('Plot updated successfully!');
    } catch (err) {
      setError('Failed to update plot');
    }
  };

  const handleViewPlot = (plot) => {
    // Navigate to a detailed view or show on map
    navigate(`/plot-details/${plot.id}`, { state: { plot } });
  };

  return (
    <div className="profile-page">
      <Container className="py-4">
        {/* Header */}
        <div className="profile-header mb-4">
          <h2 className="text-success mb-1">
            <span style={{ fontSize: '2rem' }}>👤</span> Profile Setup
          </h2>
          <p className="text-muted">Complete Your Profile</p>
          <small className="text-muted">Help us personalize your farming experience</small>
        </div>

        {/* Alerts */}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Row>
          {/* Left Column - Profile Form */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm profile-card">
              <Card.Body className="p-4">
                <Form onSubmit={handleProfileSubmit}>
                  {/* Full Name */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <span className="text-success">👤</span> Full Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      required
                    />
                  </Form.Group>

                  {/* Region/State */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <span className="text-success">📍</span> Region/State *
                    </Form.Label>
                    <Form.Select
                      name="regionState"
                      value={profileData.regionState}
                      onChange={handleProfileChange}
                      required
                    >
                      <option value="">Select your region</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Land Area */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <span className="text-success">🌾</span> Land Area (in acres) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="landArea"
                      step="0.01"
                      placeholder="Enter land area in acres"
                      value={profileData.landArea}
                      onChange={handleProfileChange}
                      required
                    />
                  </Form.Group>

                  {/* Aadhaar Number */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <span className="text-success">🆔</span> Aadhaar Number (Optional)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="aadhaarNumber"
                      placeholder="Enter Aadhaar number for Agri-Stack ..."
                      value={profileData.aadhaarNumber}
                      onChange={handleProfileChange}
                      maxLength="12"
                    />
                    <Form.Text className="text-muted">
                      For government scheme benefits and subsidies
                    </Form.Text>
                  </Form.Group>

                  <Button variant="success" type="submit" className="w-100 py-2" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Crop Preferences & Location */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm profile-card mb-3">
              <Card.Body className="p-4">
                {/* Aadhaar (duplicate for layout match) */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <span className="text-success">🆔</span> Aadhaar Number (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="aadhaarNumber"
                    placeholder="9048235142"
                    value={profileData.aadhaarNumber}
                    onChange={handleProfileChange}
                    maxLength="12"
                  />
                  <Form.Text className="text-muted">
                    For government scheme benefits and subsidies
                  </Form.Text>
                </Form.Group>

                {/* Crop Preferences */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <span className="text-success">🌱</span> Crop Preferences *
                  </Form.Label>
                  <p className="small text-muted mb-2">Select crops you grow or plan to grow</p>
                  <div className="crop-buttons">
                    {availableCrops.map(crop => (
                      <Button
                        key={crop}
                        variant={profileData.cropPreferences.includes(crop) ? 'success' : 'outline-secondary'}
                        size="sm"
                        className="m-1"
                        onClick={() => handleCropToggle(crop)}
                      >
                        {profileData.cropPreferences.includes(crop) && '✓ '}
                        {crop}
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                {/* Location Services */}
                <div className="location-section">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-success me-2" style={{ fontSize: '1.5rem' }}>📍</span>
                    <div>
                      <strong>Location Services</strong>
                      <p className="small text-muted mb-0">
                        Enable location access for weather alerts and local market prices
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="info" 
                    className="w-100 py-2"
                    onClick={handleGetLocation}
                    disabled={loading}
                  >
                    <span className="me-2">📍</span>
                    {profileData.location.latitude 
                      ? `Location: ${profileData.location.latitude.toFixed(4)}, ${profileData.location.longitude.toFixed(4)}`
                      : 'Get Current Location'
                    }
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Add New Plot Button */}
        <div className="text-center mb-4">
          <Button 
            variant="success" 
            size="lg"
            onClick={() => navigate('/plot-registration')}
          >
            <span style={{ fontSize: '1.2rem' }}>➕</span> Register New Plot
          </Button>
        </div>

        {/* Plot Cards Section */}
        <div className="plots-section">
          <h3 className="text-success mb-4">
            <span style={{ fontSize: '1.5rem' }}>🗺️</span> Your Registered Plots ({plots.length})
          </h3>

          {plots.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌾</div>
                <h5 className="text-muted">No plots registered yet</h5>
                <p className="text-muted">Start by registering your first plot!</p>
                <Button variant="success" onClick={() => navigate('/plot-registration')}>
                  Register Plot
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {plots.map((plot, index) => (
                <Col lg={4} md={6} key={plot.id || index} className="mb-4">
                  <Card className="plot-card shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="text-success mb-0">{plot.plotName}</h5>
                        <Badge bg="success">{plot.calculatedAreaSqM} m²</Badge>
                      </div>
                      
                      <p className="text-muted small mb-2">
                        {plot.description || 'No description provided'}
                      </p>

                      <div className="plot-stats mb-3">
                        <div className="d-flex justify-content-between text-muted small">
                          <span>📐 Area:</span>
                          <strong>{(plot.calculatedAreaSqM / 4046.86).toFixed(2)} acres</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted small">
                          <span>📍 Coordinates:</span>
                          <strong>{plot.polygonCoordinates?.length || 0} points</strong>
                        </div>
                        {plot.photoFile && (
                          <div className="d-flex justify-content-between text-muted small">
                            <span>📷 Photo:</span>
                            <strong>Attached</strong>
                          </div>
                        )}
                      </div>

                      {plot.photoGeo && (
                        <div className="small text-muted mb-3">
                          <strong>Location:</strong> {plot.photoGeo[0].toFixed(4)}, {plot.photoGeo[1].toFixed(4)}
                        </div>
                      )}

                      <div className="d-grid gap-2">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleViewPlot(plot)}
                        >
                          <span className="me-1">👁️</span> View on Map
                        </Button>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="flex-fill"
                            onClick={() => handleEditPlot(plot)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="flex-fill"
                            onClick={() => handleDeletePlot(plot.id)}
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Government Footer */}
        <div className="gov-footer mt-5">
          <Row className="align-items-center">
            <Col md={2} className="text-center">
              <div style={{ fontSize: '3rem' }}>🇮🇳</div>
            </Col>
            <Col md={8} className="text-center">
              <h5 className="mb-1">Ministry of Agriculture & Farmers Welfare</h5>
              <p className="mb-0">कृषि एवं किसान कल्याण मंत्रालय</p>
              <small>Government of India | भारत सरकार</small>
            </Col>
            <Col md={2} className="text-center">
              <small>© 2025 MoA&FW</small>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Edit Plot Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Edit Plot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plot Name</Form.Label>
              <Form.Control
                type="text"
                value={editPlotData.plotName || ''}
                onChange={(e) => setEditPlotData({ ...editPlotData, plotName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editPlotData.description || ''}
                onChange={(e) => setEditPlotData({ ...editPlotData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>User Provided Area</Form.Label>
              <Form.Control
                type="text"
                value={editPlotData.userProvidedArea || ''}
                onChange={(e) => setEditPlotData({ ...editPlotData, userProvidedArea: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdatePlot}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProfilePage;