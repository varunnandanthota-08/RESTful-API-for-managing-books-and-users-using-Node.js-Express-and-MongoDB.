import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Truck, RefreshCw, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', marginTop: '4rem' }}>
      {/* Service Value Props Banner */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Free Express Shipping</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>On all orders over $50</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--color-success-light)', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>100% Authentic Editions</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Verified publisher prints</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Easy 30-Day Returns</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hassle-free guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div className="nav-brand" style={{ marginBottom: '1rem' }}>
              <div className="nav-brand-icon">
                <BookOpen size={20} />
              </div>
              <span>PageTurn<span style={{ color: 'var(--color-primary)' }}>.</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              Your curated online bookstore and literary sanctuary. Discover bestsellers, classics, and niche indie masterpieces with fast home delivery.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Explore</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <li><Link to="/books" style={{ color: 'inherit' }}>All Books</Link></li>
              <li><Link to="/books?featured=true" style={{ color: 'inherit' }}>Featured Editions</Link></li>
              <li><Link to="/books?category=Technology" style={{ color: 'inherit' }}>Technology & Coding</Link></li>
              <li><Link to="/books?category=Sci-Fi" style={{ color: 'inherit' }}>Science Fiction</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Customer Care</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <li><Link to="/orders" style={{ color: 'inherit' }}>Order Tracking</Link></li>
              <li><Link to="/cart" style={{ color: 'inherit' }}>Shopping Cart</Link></li>
              <li><Link to="/wishlist" style={{ color: 'inherit' }}>My Wishlist</Link></li>
              <li><Link to="/profile" style={{ color: 'inherit' }}>Account Settings</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Bookish Dispatch</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Subscribe for new release alerts, author interviews, and exclusive discounts.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="reader@bookstore.com"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
              <button className="btn btn-primary btn-sm">Join</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          <div>© {new Date().getFullYear()} PageTurn Book Store. Full Stack Web Application. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

