import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('farmer_token');

  useEffect(() => {
    // Optional: Redirect to dashboard if logged in
    // if (isLoggedIn) {
    //   navigate('/dashboard');
    // }
  }, [isLoggedIn, navigate]);

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="auth-card">
              <Card.Body className="p-5 text-center">
                <div className="mb-4">
                  <span style={{ fontSize: '5rem' }}>🌾</span>
                </div>
                <h1 className="display-4 mb-3">किसान पोर्टल</h1>
                <h2 className="text-success mb-4">Kisan Portal</h2>
                <p className="lead text-muted mb-4">
                  Empowering Indian Farmers with Digital Solutions
                </p>

                <Row className="mt-5">
                  <Col md={4} className="mb-4">
                    <Card className="h-100 border-success">
                      <Card.Body>
                        <div className="mb-3" style={{ fontSize: '3rem' }}>📊</div>
                        <Card.Title>Farm Management</Card.Title>
                        <Card.Text>
                          Manage your farm plots, crops, and resources efficiently
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="h-100 border-success">
                      <Card.Body>
                        <div className="mb-3" style={{ fontSize: '3rem' }}>🗺️</div>
                        <Card.Title>Plot Mapping</Card.Title>
                        <Card.Text>
                          Map your agricultural land with GPS coordinates
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="h-100 border-success">
                      <Card.Body>
                        <div className="mb-3" style={{ fontSize: '3rem' }}>💰</div>
                        <Card.Title>Govt. Schemes</Card.Title>
                        <Card.Text>
                          Access government schemes and financial assistance
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="mt-4">
                  {!isLoggedIn ? (
                    <>
                      <Button 
                        variant="success" 
                        size="lg" 
                        className="me-3"
                        onClick={() => navigate('/login')}
                      >
                        Login
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="lg"
                        onClick={() => navigate('/signup')}
                      >
                        Register Now
                      </Button>
                    </>
                  ) : (
                    <Button variant="success" size="lg">
                      Go to Dashboard
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Government Footer */}
            <div className="gov-footer mt-4">
              <Row className="align-items-center">
                <Col md={2}>
                  <div style={{ fontSize: '3rem' }}>🇮🇳</div>
                </Col>
                <Col md={8}>
                  <h5 className="mb-1">Ministry of Agriculture & Farmers Welfare</h5>
                  <p className="mb-0">कृषि एवं किसान कल्याण मंत्रालय</p>
                  <small>Government of India | भारत सरकार</small>
                </Col>
                <Col md={2}>
                  <small>© 2025 MoA&FW</small>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;
