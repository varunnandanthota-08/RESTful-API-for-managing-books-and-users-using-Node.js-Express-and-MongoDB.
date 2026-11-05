import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2, DollarSign } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const CheckoutPage = ({ onNotify }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'USA',
    paymentMethod: 'credit_card',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvv: '888'
  });

  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.street || !formData.city || !formData.phone) {
      if (onNotify) onNotify('Please fill in all required shipping address fields', 'error');
      return;
    }

    if (items.length === 0) {
      if (onNotify) onNotify('Your cart is empty', 'error');
      navigate('/cart');
      return;
    }

    setProcessing(true);

    try {
      // Simulate real-world 1s payment gateway latency
      await new Promise(res => setTimeout(res, 1200));

      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        await clearCart();
        if (onNotify) onNotify('Order placed successfully!', 'success');
        navigate(`/orders/success/${data.order.orderId}`, { state: { order: data.order } });
      } else {
        if (onNotify) onNotify(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      console.error('Checkout submit error:', err);
      if (onNotify) onNotify('An error occurred while processing checkout', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Return to Cart
        </Link>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
          Checkout & Finalize Order
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Shipping & Payment Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Address Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--color-primary)" /> 1. Shipping Address
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Recipient Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Eleanor Vance"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Contact Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="San Francisco"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="CA"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="94105"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Simulated Payment Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="var(--color-primary)" /> 2. Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: `1.5px solid ${formData.paymentMethod === 'credit_card' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', background: formData.paymentMethod === 'credit_card' ? 'var(--color-primary-light)' : '#ffffff', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontWeight: 600 }}>Credit or Debit Card (Simulated)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: `1.5px solid ${formData.paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', background: formData.paymentMethod === 'upi' ? 'var(--color-primary-light)' : '#ffffff', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontWeight: 600 }}>UPI / Instant QR Payment</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: `1.5px solid ${formData.paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', background: formData.paymentMethod === 'cod' ? 'var(--color-primary-light)' : '#ffffff', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontWeight: 600 }}>Cash on Delivery (Pay at Doorstep)</span>
              </label>
            </div>

            {formData.paymentMethod === 'credit_card' && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                  <input type="text" readOnly value={formData.cardNumber} className="form-input" style={{ fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry</label>
                  <input type="text" readOnly value={formData.cardExp} className="form-input" style={{ fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>CVV</label>
                  <input type="text" readOnly value={formData.cardCvv} className="form-input" style={{ fontSize: '0.85rem' }} />
                </div>
                <div style={{ gridColumn: 'span 3', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  * Demo Sandbox Mode: Safe simulated transaction. No actual credit card charge occurs.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Review & Pay CTA */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Items in Order ({items.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {items.map((item) => {
              const book = item.book || {};
              const title = book.title || 'Book Title';
              const author = book.author || '';
              const category = book.category || 'Fiction';
              const price = book.price || item.price || 0;
              const cover = book.coverImage || generateTitleCoverSvg(title, author, category);

              return (
                <div key={book._id || item.book} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '65px', flexShrink: 0, background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                    <img
                      src={cover}
                      alt={title}
                      data-title={title}
                      data-author={author}
                      data-category={category}
                      onError={handleImageError}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', lineHeight: '1.3' }}>{title}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity} × ${Number(price).toFixed(2)}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(price * item.quantity).toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.35rem', color: 'var(--color-primary)' }}>
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {processing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '1.2rem', height: '1.2rem', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '9999px', animation: 'spin 0.6s linear infinite' }} />
                Confirming Secure Order...
              </span>
            ) : (
              `Pay $${total.toFixed(2)} & Place Order`
            )}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="var(--color-success)" /> Stock will be reserved immediately upon confirmation
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

