import React, { useState } from 'react';
import { Mail, Lock, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function LoginPage() {
  const stakeholderTabs = [
    {
      id: 'admin',
      label: 'Admin',
      accounts: [
        { display: 'Seed Seller', mobile: '9876543210', password: 'test123' },
        { display: 'Farmer', mobile: '9876543211', password: 'test123' },
        { display: 'Fpo', mobile: '9876543212', password: 'test123' },
        { display: 'Trader', mobile: '9876543213', password: 'test123' },
        { display: 'Transport', mobile: '9876543218', password: 'test123' },
        { display: 'Storage', mobile: '9876543214', password: 'test123' },
        { display: 'Manufacturer', mobile: '9876543215', password: 'test123' },
        { display: 'Retailer', mobile: '9876543216', password: 'test123' },
        { display: 'Policy Maker', mobile: '9876543217', password: 'test123' }
      ],
    },
    {
      id: 'farmer',
      label: 'Farmer',
      accounts: [
        {
          display: 'Demo Farmer',
          mobile: '8888888888',
          password: 'farmer123',
        },
      ],
    },
    {
      id: 'transporter',
      label: 'Transporter',
      accounts: [
        {
          display: 'Demo Transporter',
          mobile: '7777777777',
          password: 'transport123',
        },
      ],
    },
  ];

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [activeStakeholder, setActiveStakeholder] = useState(
    stakeholderTabs[0]?.id || ''
  );

  const navigate = useNavigate();

  // ✅ FULL MOBILE VALIDATION
  const validateMobile = () => {
    const cleaned = mobile.trim();

    if (!cleaned) {
      alert('कृपया मोबाइल नंबर दर्ज करें / Please enter mobile number');
      return false;
    }

    if (!/^\d+$/.test(cleaned)) {
      alert('मोबाइल नंबर केवल अंक होने चाहिए / Mobile number must contain only digits');
      return false;
    }

    if (cleaned.length !== 10) {
      alert('मोबाइल नंबर 10 अंकों का होना चाहिए / Mobile number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateMobile()) return;

    if (!password || password.trim().length === 0) {
      alert('कृपया पासवर्ड दर्ज करें / Please enter password');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(mobile, password);

      if (data.token && data.user) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/login-redirect');
      } else {
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

  // ENTER key support
  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const fillCredentials = (account) => {
    setMobile(account.mobile);
    setPassword(account.password);
    setShowStakeholderModal(false);
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
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 mb-3">
                    <div className="d-flex gap-2 flex-fill">
                      <button className="btn btn-success flex-fill fw-semibold">Login</button>
                      <Link
                        to="/signup"
                        className="btn btn-light flex-fill text-success fw-semibold"
                        role="button"
                      >
                        Sign Up
                      </Link>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm flex-shrink-0"
                      onClick={() => setShowStakeholderModal(true)}
                    >
                      Quick logins
                    </button>
                  </div>

                  {/* MOBILE INPUT — WITH VALIDATION */}
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
                      maxLength={10} // ≤ 10 characters
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) setMobile(value); // allow only digits
                      }}
                      onKeyDown={onKeyDown}
                      aria-label="mobile"
                    />
                  </div>

                  {/* PASSWORD INPUT */}
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

                {/* RIGHT PANEL */}
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
                        Ministry of Agriculture & Farmers Welfare
                      </h5>
                    </div>
                    <p className="text-muted small mb-0">कृषि एवं किसान कल्याण मंत्रालय</p>
                  </div>

                  <hr />

                  <div className="small text-muted">
                    <p className="mb-1">
                      समस्या? संपर्क करें:{' '}
                      <a href="#!" className="text-decoration-none">help@beejnex.com</a>
                    </p>
                    <p className="mb-0">Version: 1.0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-white-50 small">
              © {new Date().getFullYear()} किसान पोर्टल
            </div>
          </div>
        </div>
      </div>

      {/* STAKEHOLDER MODAL */}
      {showStakeholderModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Stakeholder logins</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowStakeholderModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <ul className="nav nav-tabs mb-3" role="tablist">
                    {stakeholderTabs.map((tab) => (
                      <li className="nav-item" key={tab.id}>
                        <button
                          type="button"
                          role="tab"
                          className={`nav-link ${activeStakeholder === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveStakeholder(tab.id)}
                        >
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {stakeholderTabs
                    .filter((tab) => tab.id === activeStakeholder)
                    .map((tab) => (
                      <div key={tab.id}>
                        <div className="table-responsive">
                          <table className="table table-sm align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Username / Mobile</th>
                                <th>Password</th>
                                <th className="text-end">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tab.accounts.map((account, idx) => (
                                <tr key={`${tab.id}-${idx}`}>
                                  <td className="fw-semibold">{account.display}</td>
                                  <td><code>{account.mobile}</code></td>
                                  <td><code>{account.password}</code></td>
                                  <td className="text-end">
                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm"
                                      onClick={() => fillCredentials(account)}
                                    >
                                      Fill login
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}
