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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <Sprout size={48} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">किसान पोर्टल</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-yellow-400">
          <div className="flex gap-2 mb-6 bg-green-100 p-1 rounded-lg">
            <Link to="/login" className="flex-1 py-2 rounded-lg font-semibold text-center text-green-700 hover:bg-green-200">Login</Link>
            <button className="flex-1 py-2 rounded-lg font-semibold bg-green-600 text-white shadow-md">Sign Up</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <User size={18} />
                Full Name / पूरा नाम
              </label>
              <input
                type="text"
                value={credentials.name}
                onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <Mail size={18} />
                Email / मोबाइल
              </label>
              <input
                type="text"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="Enter email or mobile"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <Lock size={18} />
                Password / पासवर्ड
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="Create password"
              />
            </div>
            <button
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            >
              Sign Up / साइन अप करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}