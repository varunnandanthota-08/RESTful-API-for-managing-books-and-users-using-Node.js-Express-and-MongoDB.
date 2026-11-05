import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onNotify }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (onNotify) onNotify(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.25rem 6rem', maxWidth: '480px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="nav-brand-icon" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', borderRadius: 'var(--radius-lg)' }}>
          <BookOpen size={24} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Sign in to access your orders, saved cart, and wishlist
        </p>
      </div>

      {/* Demo Credentials Quick-Fill Pill Bar */}
      <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', border: '1px solid #c7d2fe', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
          <Sparkles size={14} color="var(--color-primary)" /> Instant One-Click Demo Logins:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@bookstore.com', 'admin123')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <Shield size={14} color="var(--color-primary)" /> Store Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@bookstore.com', 'customer123')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <UserCheck size={14} color="var(--color-success)" /> Jane Customer
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="reader@bookstore.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.25rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

