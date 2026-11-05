import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && token) {
      fetch(`/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrder(data.order);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, order, token]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Retrieving your order confirmation...</p>
      </div>
    );
  }

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIdx = order ? steps.indexOf(order.orderStatus) : 1;

  return (
    <div className="container" style={{ padding: '4rem 1.25rem 6rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '9999px', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}>
          <CheckCircle2 size={40} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Thank You! Your Order is Confirmed
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
          We've received your order and our dispatch team has begun packaging your books.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Order Reference and Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Reference</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>{order?.orderId || id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Date</div>
            <div style={{ fontWeight: 600 }}>{order ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <span className="badge badge-primary">{order?.orderStatus || 'Processing'}</span>
          </div>
        </div>

        {/* Status Tracker */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Delivery Progress</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            {steps.map((st, idx) => {
              const isDone = idx <= (currentStepIdx === -1 ? 1 : currentStepIdx);
              return (
                <div key={st}>
                  <div style={{ height: '6px', borderRadius: '3px', background: isDone ? 'var(--color-primary)' : 'var(--color-border)', marginBottom: '0.5rem', transition: 'background 0.3s ease' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        {order?.items && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Items in this shipment:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: '44px', height: '60px', flexShrink: 0, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                    <img
                      src={item.coverImage || generateTitleCoverSvg(item.title, '', 'Fiction')}
                      alt={item.title}
                      data-title={item.title}
                      onError={handleImageError}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping address & payment */}
        {order?.shippingAddress && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>Shipping Destination:</div>
              <div style={{ color: 'var(--color-text-muted)' }}>
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>Payment Summary:</div>
              <div style={{ color: 'var(--color-text-muted)' }}>
                Method: <strong>{order.paymentMethod.replace('_', ' ').toUpperCase()}</strong><br />
                Payment Status: <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>PAID</span><br />
                Total Paid: <strong>${Number(order.totalAmount).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/orders" className="btn btn-secondary">
          <Package size={16} /> View Order History
        </Link>
        <Link to="/books" className="btn btn-primary">
          Continue Exploring <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

