import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Eye, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../../utils/imageHelper';

const AdminOrdersPage = ({ onNotify }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = selectedStatus === 'All' ? '/api/admin/orders' : `/api/admin/orders?status=${selectedStatus}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        if (onNotify) onNotify(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
        if (viewOrder && viewOrder._id === orderId) {
          setViewOrder(data.order);
        }
      } else {
        if (onNotify) onNotify(data.message || 'Status update failed', 'error');
      }
    } catch (e) {
      if (onNotify) onNotify('Error updating status', 'error');
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

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Customer Order Fulfillment
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Track shipments, update delivery milestones, and review customer addresses
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: '#ffffff', padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`btn btn-sm ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Change Status</th>
              <th style={{ textAlign: 'right' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No orders found for the "{selectedStatus}" status.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{order.orderId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.shippingAddress?.city}, {order.shippingAddress?.country}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>${Number(order.totalAmount).toFixed(2)}</td>
                  <td>{getStatusBadge(order.orderStatus)}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setViewOrder(order)}
                      className="btn btn-secondary btn-sm"
                      title="Inspect full order"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Order Modal */}
      {viewOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Order Details</h2>
                <div style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{viewOrder.orderId}</div>
              </div>
              <button onClick={() => setViewOrder(null)} style={{ color: 'var(--color-text-light)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Purchased Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {viewOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '38px', height: '52px', flexShrink: 0, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px', overflow: 'hidden' }}>
                      <img
                        src={it.coverImage || generateTitleCoverSvg(it.title, '', 'Fiction')}
                        alt={it.title}
                        data-title={it.title}
                        onError={handleImageError}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{it.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quantity: {it.quantity} × ${Number(it.price).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>${(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Shipping Address:</div>
              <div>{viewOrder.shippingAddress.fullName}</div>
              <div>{viewOrder.shippingAddress.street}</div>
              <div>{viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.state} {viewOrder.shippingAddress.zipCode}</div>
              <div>{viewOrder.shippingAddress.country}</div>
              <div>Phone: {viewOrder.shippingAddress.phone}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Current Status: </span>
                {getStatusBadge(viewOrder.orderStatus)}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                Total: ${Number(viewOrder.totalAmount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;

