import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BookCard from '../components/BookCard';

const WishlistPage = ({ onNotify }) => {
  const { token, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistBooks(data.wishlist || []);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleRemove = async (bookId) => {
    try {
      await toggleWishlist(bookId);
      setWishlistBooks(prev => prev.filter(b => b._id !== bookId));
      if (onNotify) onNotify('Item removed from wishlist', 'info');
    } catch (err) {
      if (onNotify) onNotify('Failed to remove item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading saved titles...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          My Saved Wishlist
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {wishlistBooks.length} {wishlistBooks.length === 1 ? 'book' : 'books'} saved for future reading sessions
        </p>
      </div>

      {wishlistBooks.length === 0 ? (
        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Heart size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Click the heart icon on any book cover to save it here for later.
          </p>
          <Link to="/books" className="btn btn-primary">
            Explore Books <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="book-grid">
          {wishlistBooks.map((book) => (
            <div key={book._id} style={{ position: 'relative' }}>
              <BookCard book={book} onNotify={onNotify} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;

