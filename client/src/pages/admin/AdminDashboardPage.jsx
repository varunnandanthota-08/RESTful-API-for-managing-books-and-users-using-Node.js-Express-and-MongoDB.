import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, BookOpen, Users, AlertTriangle, ArrowRight, Package, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../../utils/imageHelper';

const AdminDashboardPage = ({ onNotify }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Fetch admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading administrator analytics...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      {/* Admin Header with Shortcuts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <TrendingUp size={16} /> Management Console
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Store Administration Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Real-time business performance, sales metrics, and catalog inventory status
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/books" className="btn btn-secondary">
            <BookOpen size={16} /> Manage Book Catalog
          </Link>
          <Link to="/admin/orders" className="btn btn-primary">
            <Package size={16} /> Process Orders
          </Link>
        </div>
      </div>

      {/* KPI Stats Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Total Revenue */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>Active orders</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {stats?.totalOrders || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Lifetime volume</div>
          </div>
        </div>

        {/* Total Books */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-light)', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Book Titles</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {stats?.totalBooks || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Published in catalog</div>
          </div>
        </div>

        {/* Registered Users */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-lg)', background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Registered Readers</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {stats?.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active customer base</div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Recent Orders Overview */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.recentOrders?.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No orders placed yet.</p>
            ) : (
              stats?.recentOrders?.map((ord) => (
                <div key={ord._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{ord.orderId}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{ord.user?.name || 'Guest'} • {new Date(ord.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800 }}>${Number(ord.totalAmount).toFixed(2)}</div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{ord.orderStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Inventory Alert */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Inventory Stock Alerts</h2>
            </div>
            <Link to="/admin/books" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Restock <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.lowStockBooks?.length === 0 ? (
              <div style={{ padding: '1rem', background: 'var(--color-success-light)', color: '#065f46', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                All book titles currently have healthy inventory levels (&gt; 5 units).
              </div>
            ) : (
              stats?.lowStockBooks?.map((book) => (
                <div key={book._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '30px', height: '42px', flexShrink: 0, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px', overflow: 'hidden' }}>
                      <img
                        src={book.coverImage || generateTitleCoverSvg(book.title, book.author, book.category)}
                        alt={book.title}
                        data-title={book.title}
                        data-author={book.author}
                        data-category={book.category}
                        onError={handleImageError}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.title}
                    </span>
                  </div>
                  <div>
                    <span className={`badge ${book.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {book.stock === 0 ? 'Out of Stock' : `${book.stock} remaining`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

