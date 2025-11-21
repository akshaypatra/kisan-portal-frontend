import React, { useState } from 'react';
import { User, Mail, Lock, Sprout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = () => {
    if (credentials.name && credentials.email && credentials.password) {
      // replace with real signup flow
      navigate('/register');
    } else {
      alert('कृपया सभी फील्ड भरें / Please fill all fields');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSignup();
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
            </div>

            <div className="card shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                <div className="col-12 col-lg-7 p-4" style={{ background: 'white' }}>
                  <div className="d-flex gap-2 mb-3">
                    <Link
                      to="/login"
                      className="btn btn-light flex-fill text-success fw-semibold"
                      role="button"
                    >
                      Login
                    </Link>
                    <button className="btn btn-success flex-fill fw-semibold">Sign Up</button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <User size={18} />
                      Full Name / पूरा नाम
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter your name"
                      value={credentials.name}
                      onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                      onKeyDown={onKeyDown}
                      aria-label="full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Mail size={18} />
                      Email / मोबाइल
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter email or mobile"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      onKeyDown={onKeyDown}
                      aria-label="email or mobile"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Lock size={18} />
                      Password / पासवर्ड
                    </label>
                    <input
                      type="password"
                      className="form-control border-success"
                      placeholder="Create password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      onKeyDown={onKeyDown}
                      aria-label="password"
                    />
                  </div>

                  <button onClick={handleSignup} className="btn btn-success w-100 fw-bold mt-2">
                    Sign Up / साइन अप करें
                  </button>
                </div>

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
                      सहायता चाहिए? संपर्क करें: <a href="#!" className="text-decoration-none">kisan-portal@example.com</a>
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
