import React, { useState } from 'react';
import { User, Phone, Lock, Sprout, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

export default function SignupPage() {
  const [credentials, setCredentials] = useState({
    name: '',
    mobile: '',
    password: '',
    role: 'farmer',
    agristack_id: '',
    storageOwnerType: 'storage_business',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: 'farmer', label: 'Farmer / किसान' },
    { value: 'seed_seller', label: 'Seed Seller / बीज विक्रेता' },
    { value: 'fpo', label: 'FPO / किसान उत्पादक संगठन' },
    { value: 'trader', label: 'Trader / व्यापारी' },
    { value: 'transport', label: 'Transport / परिवहन' },
    { value: 'storage', label: 'Storage / भंडारण' },
    { value: 'manufacturer', label: 'Manufacturer / निर्माता' },
    { value: 'retailer', label: 'Retailer / खुदरा विक्रेता' },
    { value: 'policy_maker', label: 'Policy Maker / नीति निर्माता' },
  ];

  const ownerTypeOptions = [
    { value: 'storage_business', label: 'Storage Business' },
    { value: 'fpo', label: 'Farmer Producer Organization' },
    { value: 'company_center', label: 'Company Collection Center' },
  ];

  // 🔍 VALIDATIONS
  const validate = () => {
    const { name, mobile, password, role, storageOwnerType } = credentials;

    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();

    // Basic empty check
    if (!trimmedName || !trimmedMobile || !password.trim() || !role) {
      alert('कृपया सभी फील्ड भरें / Please fill all fields');
      return false;
    }

    // 1️⃣ Name: only letters + spaces
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      alert(
        'नाम में केवल अक्षर और स्पेस होने चाहिए / Name should contain only letters and spaces'
      );
      return false;
    }

    // 2️⃣ Mobile: digits only, exactly 10 digits
    if (!/^\d{10}$/.test(trimmedMobile)) {
      alert(
        'मोबाइल नंबर 10 अंकों का होना चाहिए और केवल अंक होने चाहिए / Mobile number must be 10 digits and contain digits only'
      );
      return false;
    }

    // 3️⃣ Password: at least 8 chars + at least 1 special character
    if (password.length < 8) {
      alert(
        'पासवर्ड कम से कम 8 वर्ण का होना चाहिए / Password must be at least 8 characters'
      );
      return false;
    }

    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    if (!hasSpecialChar) {
      alert(
        'पासवर्ड में कम से कम 1 विशेष चिन्ह होना चाहिए / Password must contain at least one special character'
      );
      return false;
    }

    // Storage owner type required if role is storage
    if (role === 'storage' && !storageOwnerType) {
      alert('Please select the storage owner type');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: credentials.name.trim(),
        mobile: credentials.mobile.trim(),
        password: credentials.password,
        role: credentials.role,
      };

      if (credentials.role === 'storage') {
        payload.storage_owner_type = credentials.storageOwnerType;
      }

      const data = await authService.register(payload);

      if (data.token && data.user) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('रजिस्ट्रेशन सफल / Registration successful');
        navigate('/login-redirect');
      } else {
        alert('रजिस्ट्रेशन असफल हुआ – कृपया पुन: प्रयास करें');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
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

                  {/* Role Selection */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                      <Briefcase size={18} /> Role / भूमिका
                    </label>
                    <select
                      className="form-select border-success"
                      value={credentials.role}
                      onChange={(e) =>
                        setCredentials({ ...credentials, role: e.target.value })
                      }
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {credentials.role === 'storage' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold d-flex align-items-center gap-2 text-success mb-2">
                        Owner Type
                      </label>
                      <select
                        className="form-select border-success"
                        value={credentials.storageOwnerType}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            storageOwnerType: e.target.value,
                          })
                        }
                      >
                        {ownerTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                      onChange={(e) => {
                        const value = e.target.value;
                        // allow only letters and spaces
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setCredentials({ ...credentials, name: value });
                        }
                      }}
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
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value;
                        // allow only digits
                        if (/^\d*$/.test(value)) {
                          setCredentials({ ...credentials, mobile: value });
                        }
                      }}
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
                    <small className="text-muted">
                      कम से कम 8 वर्ण और 1 विशेष चिन्ह आवश्यक /
                      Minimum 8 characters and 1 special character required
                    </small>
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
                        help@beejnex.com
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
