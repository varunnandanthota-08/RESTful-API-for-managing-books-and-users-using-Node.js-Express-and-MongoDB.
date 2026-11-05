import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingBag, Heart, User, LogOut, LayoutDashboard, Package, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onNotify }) => {
  const { user, isAuthenticated, isAdmin, logout, wishlist } = useAuth();
  const { itemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    if (onNotify) onNotify('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <BookOpen size={20} />
          </div>
          <span>PageTurn<span style={{ color: 'var(--color-primary)' }}>.</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Explore Books
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={15} /> Admin Portal
              </span>
            </NavLink>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="nav-actions">
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="nav-icon-btn" title="Saved Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="cart-counter" style={{ backgroundColor: '#ef4444' }}>
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="nav-icon-btn" title="Shopping Cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="cart-counter">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    {isAdmin && (
                      <span className="badge badge-primary" style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}>
                        Administrator
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="user-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} color="var(--color-primary)" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>Profile Settings</span>
                  </Link>

                  <div className="user-dropdown-divider" />

                  <button
                    onClick={handleLogout}
                    className="user-dropdown-item"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn nav-icon-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', borderTop: '1px solid var(--color-border)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Home</Link>
            <Link to="/books" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Explore Books</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Wishlist</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Cart ({itemCount})</Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>My Orders</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Profile</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 700, color: 'var(--color-primary)' }}>Admin Portal</Link>
                )}
                <button onClick={handleLogout} style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600, color: 'var(--color-danger)' }}>Sign Out</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

