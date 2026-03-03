import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SparklesIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', formData);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Client management',
    'Proposal builder',
    'Task kanban board',
    'Time tracking'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-5xl px-6 flex items-center">
        {/* Left side - Features */}
        <div className="hidden lg:block lg:w-1/2 lg:pr-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                          bg-gradient-to-br from-violet-600 to-indigo-600 
                          shadow-lg shadow-violet-500/30 mb-8">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Manage your agency{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              like a pro
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10">
            The all-in-one platform for marketing agencies to manage clients, 
            proposals, tasks, and time tracking.
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={feature} 
                   className="flex items-center space-x-3"
                   style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-violet-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="text-center mb-8 lg:hidden">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-500 mt-1">Start managing your agency today</p>
            </div>
            
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-500 mt-1">Start your 14-day free trial</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                           text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Agency (optional)"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                           text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                           text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                             transition-all duration-200 pr-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                             hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 
                         text-white font-semibold rounded-xl
                         shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 
                         transform hover:-translate-y-0.5 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to="/login" 
                      className="font-semibold text-violet-600 hover:text-violet-700 
                               hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;