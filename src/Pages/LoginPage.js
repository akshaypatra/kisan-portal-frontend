import React, { useState } from 'react';
import { Mail, Lock, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateMobile = () => {
    if (!mobile || mobile.trim().length < 6) {
      alert('कृपया वैध मोबाइल नंबर दर्ज करें / Please enter a valid mobile number');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!validateMobile()) return;
    if (!password || password.trim().length === 0) {
      alert('कृपया पासवर्ड दर्ज करें / Please enter password');
      return;
    }

    setLoading(true);
    try {
      // Call backend login API
      const data = await authService.login(mobile, password);

      // Backend returns { token, user }
      if (data.token && data.user) {
        // Store token and user data
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('लॉगिन सफल / Login successful');

        // Redirect to dashboard router which will route based on role
        navigate('/login-redirect');
      } else {
        console.warn('Unexpected login response:', data);
        alert('लॉगिन असफल: सर्वर से टोकन नहीं मिला / Login failed: no tokens returned');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'लॉगिन में समस्या आई। कृपया पुनः प्रयास करें।';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          'linear-gradient(135deg, #16a34a 0%, #10b981 40%, #f59e0b 100%)',
        padding: '1rem',
      }}
    >
      <div className="container" style={{ maxWidth: 920 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
            <div className="text-center mb-4">
              <div
                className="bg-white rounded-circle mx-auto d-flex align-items-center justify-content-center shadow"
                style={{ width: 96, height: 96 }}
              >
                <Sprout size={48} className="text-success" />
              </div>
              <h1 className="display-6 fw-bold text-white mt-3">किसान पोर्टल</h1>
              <p className="text-white-50 mb-0">Empowering Indian Farmers</p>
            </div>

            <div className="card shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                <div className="col-12 col-lg-7 p-4" style={{ background: 'white' }}>
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-success flex-fill fw-semibold">Login</button>
                    <Link to="/signup" className="btn btn-light flex-fill text-success fw-semibold" role="button">Sign Up</Link>
                  </div>

                  {/* Mobile input */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Mail size={18} />
                      Mobile / मोबाइल
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      onKeyDown={onKeyDown}
                      aria-label="mobile"
                    />
                  </div>

                  {/* Password input */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Lock size={18} />
                      Password / पासवर्ड
                    </label>
                    <input
                      type="password"
                      className="form-control border-success"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={onKeyDown}
                      aria-label="password"
                    />
                  </div>

                  {/* Login button */}
                  <div className="mb-3">
                    <button
                      onClick={handleLogin}
                      className="btn btn-success w-100 fw-bold"
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : 'Login / लॉगिन करें'}
                    </button>
                  </div>
                </div>

                {/* Right panel */}
                <div
                  className="col-12 col-lg-5 p-4 d-flex flex-column justify-content-center"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(245,158,11,0.06))',
                    borderLeft: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="text-center mb-3">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <div
                        className="rounded-circle"
                        style={{
                          width: 36,
                          height: 36,
                          background: 'linear-gradient(135deg,#f97316,#10b981)',
                        }}
                      />
                      <h5 className="mb-0 text-success fw-bold">
                        Ministry of Agriculture &amp; Farmers Welfare
                      </h5>
                    </div>
                    <p className="text-muted small mb-0">कृषि एवं किसान कल्याण मंत्रालय</p>
                  </div>

                  <hr />

                  <div className="small text-muted">
                    <p className="mb-1">
                      समस्या? संपर्क करें:{' '}
                      <a href="#!" className="text-decoration-none">kisan-portal@example.com</a>
                    </p>
                    <p className="mb-0">Version: 1.0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-white-50 small">© {new Date().getFullYear()} किसान पोर्टल</div>
          </div>
        </div>
      </div>
    </div>
  );
}
