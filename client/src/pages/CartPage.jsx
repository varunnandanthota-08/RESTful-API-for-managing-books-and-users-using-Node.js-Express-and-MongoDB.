import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const CartPage = ({ onNotify }) => {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      if (onNotify) onNotify('Please sign in or create an account to proceed to checkout', 'info');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '9999px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShoppingBag size={36} />
        </div>
        <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Your Shopping Cart is Empty
        </h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Looks like you haven't added any books to your cart yet. Explore our curated collections to find your next great read!
        </p>
        <Link to="/books" className="btn btn-primary btn-lg">
          Explore Books Catalog <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Shopping Cart
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Review your selected titles before continuing to secure checkout
          </p>
        </div>

        <button
          onClick={async () => {
            await clearCart();
            if (onNotify) onNotify('Cart cleared', 'info');
          }}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--color-danger)' }}
        >
          <Trash2 size={16} /> Empty Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {items.map((item) => {
              const book = item.book || {};
              const bookId = book._id || item.book;
              const title = book.title || 'Untitled Book';
              const author = book.author || '';
              const category = book.category || 'Fiction';
              const coverImage = book.coverImage || generateTitleCoverSvg(title, author, category);
              const price = book.price || item.price || 0;
              const maxStock = book.stock !== undefined ? book.stock : 99;

              return (
                <div
                  key={bookId}
                  style={{ display: 'grid', gridTemplateColumns: '75px 1fr auto', gap: '1.25rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}
                >
                  <Link to={`/books/${bookId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '105px', background: '#f8fafc', border: '1px solid var(--color-border)', padding: '0.25rem' }}>
                    <img
                      src={coverImage}
                      alt={title}
                      data-title={title}
                      data-author={author}
                      data-category={category}
                      onError={handleImageError}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
                    />
                  </Link>

                  <div>
                    <Link to={`/books/${bookId}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-main)', display: 'block', marginBottom: '0.25rem' }}>
                      {title}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      by {author}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                        ${(Number(price) * item.quantity).toFixed(2)}
                      </div>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          (${Number(price).toFixed(2)} each)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity modifier and Delete */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
                      <button
                        onClick={() => updateQuantity(bookId, item.quantity - 1)}
                        style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ width: '2rem', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity >= maxStock) {
                            if (onNotify) onNotify(`Maximum available stock reached (${maxStock})`, 'error');
                            return;
                          }
                          updateQuantity(bookId, item.quantity + 1);
                        }}
                        style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(bookId);
                        if (onNotify) onNotify('Item removed from cart', 'info');
                      }}
                      style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/books" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>${tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Standard Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--color-success)' : 'var(--color-text-main)' }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            {shipping > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                Add ${(50 - subtotal).toFixed(2)} more to qualify for FREE shipping!
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '1.25rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>Total Due</span>
            <span style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--color-primary)' }}>
              ${total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <ShieldCheck size={16} color="var(--color-success)" /> Encrypted 256-bit checkout simulation
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

