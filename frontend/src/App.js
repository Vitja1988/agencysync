import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Clients from './components/Clients/Clients';
import Proposals from './components/Proposals/Proposals';
import Tasks from './components/Tasks/Tasks';
import TimeTracking from './components/TimeTracking/TimeTracking';
import Layout from './components/Layout/Layout';
import LandingPage from './components/LandingPage/LandingPage';

// Set auth token for all requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Verify token and get user info
      axios.get('/api/auth/verify')
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          user ? <Navigate to="/dashboard" /> : <LandingPage onLoginClick={() => window.location.href = '/login'} />
        } />
        <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        <Route path="/clients" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Clients />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        <Route path="/proposals" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Proposals />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        <Route path="/tasks" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Tasks />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        <Route path="/time" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <TimeTracking />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;