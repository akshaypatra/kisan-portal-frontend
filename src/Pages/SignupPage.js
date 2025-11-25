import React, { useState } from 'react';
import { User, Phone, Lock, Sprout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../config';

export default function SignupPage() {
  const [credentials, setCredentials] = useState({
    name: '',
    mobile: '',
    password: '',
    agristack_id: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const { name, mobile, password } = credentials;

    if (!name.trim() || !mobile.trim() || !password.trim()) {
      alert('कृपया सभी फील्ड भरें / Please fill all fields');
      return false;
    }

    if (mobile.length < 6) {
      alert('कृपया वैध मोबाइल नंबर दर्ज करें / Please enter a valid mobile number');
      return false;
    }

    if (password.length < 6) {
      alert('पासवर्ड कम से कम 6 वर्ण का होना चाहिए / Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: credentials.name,
        mobile: credentials.mobile,
        password: credentials.password,
        agristack_id: credentials.agristack_id,
      };

      const res = await axios.post(
        CONFIG.API_BASE_URL + '/api/auth/register',
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Successful response example:
      // {
      //   "id": 1,
      //   "name": "John",
      //   "mobile": "9876543210",
      //   "role": "farmer",
      //   "agristack_id": "AGRI123"
      // }

      if (res.status === 200 || res.status === 201) {
        const userData = res.data;

        // Store complete user object in localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        alert('रजिस्ट्रेशन सफल / Registration successful');

        navigate('/login');
      } else {
        alert('रजिस्ट्रेशन असफल हुआ – कृपया पुन: प्रयास करें');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'कुछ गलत हुआ। कृपया बाद में पुनः प्रयास करें।';
      alert(msg);
    } finally {
      setLoading(false);
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
                    >
                      Login
                    </Link>
                    <button className="btn btn-success flex-fill fw-semibold">
                      Sign Up
                    </button>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <User size={18} /> Full Name / पूरा नाम
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter your name"
                      value={credentials.name}
                      onChange={(e) =>
                        setCredentials({ ...credentials, name: e.target.value })
                      }
                      onKeyDown={onKeyDown}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Phone size={18} /> Mobile / मोबाइल
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter mobile number"
                      value={credentials.mobile}
                      onChange={(e) =>
                        setCredentials({ ...credentials, mobile: e.target.value })
                      }
                      onKeyDown={onKeyDown}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Lock size={18} /> Password / पासवर्ड
                    </label>
                    <input
                      type="password"
                      className="form-control border-success"
                      placeholder="Create password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      onKeyDown={onKeyDown}
                    />
                  </div>

                  {/* Agristack ID */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Sprout size={18} /> Agristack ID (optional)
                    </label>
                    <input
                      type="text"
                      className="form-control border-success"
                      placeholder="Enter agristack id (if any)"
                      value={credentials.agristack_id}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          agristack_id: e.target.value,
                        })
                      }
                      onKeyDown={onKeyDown}
                    />
                  </div>

                  <button
                    onClick={handleSignup}
                    className="btn btn-success w-100 fw-bold mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Signing up...' : 'Sign Up / साइन अप करें'}
                  </button>
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
                        Ministry of Agriculture & Farmers Welfare
                      </h5>
                    </div>
                    <p className="text-muted small mb-0">
                      कृषि एवं किसान कल्याण मंत्रालय
                    </p>
                  </div>

                  <hr />

                  <div className="small text-muted">
                    <p className="mb-1">
                      सहायता चाहिए? संपर्क करें:{' '}
                      <a href="#!" className="text-decoration-none">
                        kisan-portal@example.com
                      </a>
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
    </div>
  );
}
