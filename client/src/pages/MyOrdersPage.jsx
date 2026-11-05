import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const MyOrdersPage = ({ onNotify }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be returned to inventory.')) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (onNotify) onNotify('Order cancelled and stock restored', 'success');
        fetchOrders();
      } else {
        if (onNotify) onNotify(data.message || 'Could not cancel order', 'error');
      }
    } catch (err) {
      if (onNotify) onNotify('Error cancelling order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'Cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'Shipped':
        return <span className="badge badge-primary">Shipped</span>;
      case 'Processing':
        return <span className="badge badge-warning">Processing</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          My Order History
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Track recent book shipments and review past invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Package size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Orders Placed Yet</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>
            You haven't made any purchases yet. Start building your personal reading library today!
          </p>
          <Link to="/books" className="btn btn-primary">
            Explore Books <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: '1.75rem' }}>
              {/* Order Card Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Order ID</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{order.orderId}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Paid</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>${Number(order.totalAmount).toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(order.orderStatus)}

                  {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Items List in Order */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '42px', height: '58px', flexShrink: 0, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                      <img
                        src={item.coverImage || generateTitleCoverSvg(item.title, '', 'Fiction')}
                        alt={item.title}
                        data-title={item.title}
                        onError={handleImageError}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <Link to={`/books/${item.book}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

