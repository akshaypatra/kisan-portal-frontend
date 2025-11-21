import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmer_name: '',
    phone_number: '',
    aadhaar_card: '',
    kcc_id: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    // Aadhaar validation
    if (!/^[0-9]{12}$/.test(formData.aadhaar_card)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
    // API call to backend
      const response = await axios.post('https://your-api-domain.com/api/signup', {
        farmer_name: formData.farmer_name,
        phone_number: formData.phone_number,
        aadhaar_card: formData.aadhaar_card,
        kcc_id: formData.kcc_id,
        email: formData.email,
        password: formData.password
      });

    // CHANGE: Store farmer_id and token immediately after signup
      const { farmer_id, token, farmer_name } = response.data;
    
      localStorage.setItem('farmer_token', token);
      localStorage.setItem('farmer_id', farmer_id);
      localStorage.setItem('farmer_name', farmer_name);

      setSuccess(`✅ Registration Successful! Your Farmer ID: ${farmer_id}`);
    
    // Redirect to profile page to complete profile
      setTimeout(() => {
        navigate('/profile');  // CHANGE: Go to profile instead of login
      }, 2000);
    
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={8}>
            <Card className="auth-card">
              {/* Header */}
              <div className="auth-header">
                <div className="farm-icon">🌾</div>
                <h2 className="mb-0">किसान पंजीकरण</h2>
                <p className="mb-0">Farmer Registration</p>
              </div>

              {/* Body */}
              <div className="auth-body">
                {error && (
                  <Alert variant="danger" className="alert-custom" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert variant="success" className="alert-custom">
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Farmer Name */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">👤</span> Farmer Name / किसान का नाम *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="farmer_name"
                      placeholder="Enter full name"
                      value={formData.farmer_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Phone Number */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">📱</span> Phone Number / मोबाइल नंबर *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone_number"
                      placeholder="10-digit mobile number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      maxLength="10"
                      required
                    />
                  </Form.Group>

                  {/* Aadhaar Card */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">🆔</span> Aadhaar Card / आधार कार्ड *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="aadhaar_card"
                      placeholder="12-digit Aadhaar number"
                      value={formData.aadhaar_card}
                      onChange={handleChange}
                      maxLength="12"
                      required
                    />
                  </Form.Group>

                  {/* KCC ID */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">💳</span> KCC ID (Kisan Credit Card) *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="kcc_id"
                      placeholder="Enter KCC ID"
                      value={formData.kcc_id}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">📧</span> Email / ईमेल *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">🔒</span> Password / पासवर्ड *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Create password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span className="text-success">🔒</span> Confirm Password / पासवर्ड की पुष्टि करें *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      placeholder="Re-enter password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Submit Button */}
                  <Button 
                    variant="success" 
                    type="submit" 
                    className="w-100 btn-auth"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Registering...
                      </>
                    ) : (
                      'Register / पंजीकरण करें'
                    )}
                  </Button>
                </Form>

                {/* Login Link */}
                <div className="auth-link">
                  <p className="mb-0">
                    Already registered? / पहले से पंजीकृत? <Link to="/login">Login here</Link>
                  </p>
                </div>
              </div>
            </Card>

            {/* Government Footer */}
            <div className="gov-footer">
              <div className="d-flex align-items-center justify-content-center">
                <div className="me-3" style={{ fontSize: '2rem' }}>🇮🇳</div>
                <div className="text-start">
                  <strong>Ministry of Agriculture & Farmers Welfare</strong>
                  <div><small>कृषि एवं किसान कल्याण मंत्रालय</small></div>
                  <div><small>Government of India</small></div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignupPage;
