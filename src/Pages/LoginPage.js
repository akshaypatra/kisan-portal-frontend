import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { mockLogin } from '../utils/mockApi';
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmer_id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call to backend
      // const response = await axios.post(
      //   "https://your-api-domain.com/api/login",
      //   {
      //     farmer_id: formData.farmer_id,
      //     password: formData.password,
      //   }
      const response = await mockLogin(formData.farmer_id,formData.password);
      

      // Store token, farmer_id, and farmer_name
      const { token, farmer_id, farmer_name } = response.data;

      localStorage.setItem("farmer_token", token);
      localStorage.setItem("farmer_id", farmer_id);
      localStorage.setItem("farmer_name", farmer_name || "Farmer"); // ADD THIS

      // OPTIONAL: Check if profile is complete
      try {
        const profileCheck = await axios.get(
          `https://your-api-domain.com/api/profile/${farmer_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // If profile incomplete (no regionState or landArea), go to profile
        if (!profileCheck.data.regionState || !profileCheck.data.landArea) {
          navigate("/profile");
        } else {
          navigate("/"); // Go to home/dashboard if profile complete
        }
      } catch (err) {
        // If profile doesn't exist, redirect to profile page
        navigate("/profile");
      }

      alert("✅ Login Successful! स्वागत है!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <Card className="auth-card">
              {/* Header */}
              <div className="auth-header">
                <div className="farm-icon">🌾</div>
                <h2 className="mb-0">किसान लॉगिन</h2>
                <p className="mb-0">Farmer Login Portal</p>
              </div>

              {/* Body */}
              <div className="auth-body">
                {error && (
                  <Alert
                    variant="danger"
                    className="alert-custom"
                    dismissible
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Farmer ID */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span className="text-success">👤</span> Farmer ID / किसान
                      आईडी *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="farmer_id"
                      placeholder="Enter your Farmer ID"
                      value={formData.farmer_id}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span className="text-success">🔒</span> Password /
                      पासवर्ड *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
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
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      "Login / लॉगिन करें"
                    )}
                  </Button>
                </Form>

                {/* Sign Up Link */}
                <div className="auth-link">
                  <p className="mb-0">
                    New farmer? / नए किसान?{" "}
                    <Link to="/signup">Register here</Link>
                  </p>
                </div>
              </div>
            </Card>

            {/* Government Footer */}
            <div className="gov-footer">
              <div className="d-flex align-items-center justify-content-center">
                <div className="me-3" style={{ fontSize: "2rem" }}>
                  🇮🇳
                </div>
                <div className="text-start">
                  <strong>Ministry of Agriculture & Farmers Welfare</strong>
                  <div>
                    <small>कृषि एवं किसान कल्याण मंत्रालय</small>
                  </div>
                  <div>
                    <small>Government of India</small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;