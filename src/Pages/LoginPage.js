import React, { useEffect, useState, useRef } from 'react';
import { Mail, Lock, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../config';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(''); // OTP is treated as "password"
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const cooldownRef = useRef(null);
  const navigate = useNavigate();

  // Login endpoint
  const LOGIN_URL = `${CONFIG.API_BASE_URL}/api/auth/login`;

  useEffect(() => {
    // countdown tick for resend cooldown
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [resendCooldown]);

  const validateMobile = () => {
    if (!mobile || mobile.trim().length < 6) {
      alert('कृपया वैध मोबाइल नंबर दर्ज करें / Please enter a valid mobile number');
      return false;
    }
    return true;
  };

  // Client-side "Request OTP" — just simulate sending and show an alert
  const requestOtpClientSide = () => {
    if (!validateMobile()) return;

    setOtpSent(true);
    setResendCooldown(30); // 30 seconds cooldown for resend
    alert(`OTP भेज दिया गया है ${mobile} पर / OTP has been sent to ${mobile}`);
  };

  // Resend button (client-side)
  const handleResend = () => {
    if (!validateMobile()) return;
    if (resendCooldown > 0) return; // guard

    // Simulate resend
    setResendCooldown(30);
    alert(`OTP पुनः भेज दिया गया है ${mobile} पर / OTP resent to ${mobile}`);
  };

  const handleLogin = async () => {
    // mobile must be valid and otp must be present
    if (!validateMobile()) return;
    if (!otp || otp.trim().length === 0) {
      alert('कृपया OTP दर्ज करें / Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      // Since OTP is treated as "password", send as password
      const payload = { mobile, password: otp };

      const res = await axios.post(
        LOGIN_URL,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = res.data;

      // try common token shapes
      const accessToken = data.access || (data.tokens && data.tokens.access) || (data?.data && data.data.access);
      const refreshToken = data.refresh || (data.tokens && data.tokens.refresh) || (data?.data && data.data.refresh);
      // user object might be inside data.user or at top-level (or the whole response)
      const user = data.user || (data?.data && data.data.user) || data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          // ignore serialization errors
        }
        alert('लॉगिन सफल / Login successful');
        navigate('/dashboard');
      } else {
        // Some backends return access only; handle that too
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          try {
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {}
          alert('लॉगिन सफल / Login successful (token stored)');
          navigate('/dashboard');
        } else {
          console.warn('Unexpected login response:', data);
          alert('लॉगिन असफल: सर्वर से टोकन नहीं मिला / Login failed: no tokens returned');
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'लॉगिन में समस्या आई। कृपया पुनः प्रयास करें।';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // handle Enter key
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!otpSent) {
        // simulate requesting OTP (no backend)
        requestOtpClientSide();
      } else {
        handleLogin();
      }
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
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control border-success"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        onKeyDown={onKeyDown}
                        aria-label="mobile"
                      />
                      <button
                        className="btn btn-outline-success"
                        type="button"
                        onClick={requestOtpClientSide}
                        disabled={otpSent}
                        style={{ minWidth: 120 }}
                      >
                        {otpSent ? 'OTP Sent' : 'Request OTP'}
                      </button>
                    </div>
                    <div className="form-text text-muted">
                      {otpSent ? `OTP भेज दिया गया है ${mobile} पर` : 'OTP मोबाइल नंबर पर भेजा जाएगा। (सिमुलेटेड)'}
                    </div>
                  </div>

                  {/* OTP (password) input - shown after OTP requested */}
                  {otpSent && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                          <Lock size={18} />
                          OTP (Password) / Oटीपी (पासवर्ड)
                        </label>
                        <input
                          type="text"
                          className="form-control border-success"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          onKeyDown={onKeyDown}
                          aria-label="otp"
                        />
                      </div>

                      <div className="d-flex gap-2 mb-3">
                        <button
                          onClick={handleLogin}
                          className="btn btn-success flex-fill fw-bold"
                          disabled={loading}
                        >
                          {loading ? 'Please wait...' : 'Login / लॉगिन करें'}
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleResend}
                          disabled={resendCooldown > 0}
                        >
                          {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                        </button>
                      </div>
                    </>
                  )}
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
