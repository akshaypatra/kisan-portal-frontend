import React, { useState } from 'react';
import { Mail, Lock, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = () => {
    if (credentials.email && credentials.password) {
      // replace with real auth flow
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
          <p className="text-green-100 text-lg">Empowering Indian Farmers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-yellow-400">
          <div className="flex gap-2 mb-6 bg-green-100 p-1 rounded-lg">
            <button className="flex-1 py-2 rounded-lg font-semibold bg-green-600 text-white shadow-md">Login</button>
            <Link to="/signup" className="flex-1 py-2 rounded-lg font-semibold text-center text-green-700 hover:bg-green-200">
              Sign Up
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <Mail size={18} />
                Email / मोबाइल
              </label>
              <input
                type="text"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            >
              Login / लॉगिन करें
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-4 border-t-4 border-orange-500">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-full"></div>
              <h3 className="font-bold text-green-800">Ministry of Agriculture & Farmers Welfare</h3>
            </div>
            <p className="text-sm text-gray-600">कृषि एवं किसान कल्याण मंत्रालय</p>
          </div>
        </div>
      </div>
    </div>
  );
}