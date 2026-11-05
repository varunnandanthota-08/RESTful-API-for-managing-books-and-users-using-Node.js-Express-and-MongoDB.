import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Truck, RefreshCw, Star, MessageSquare } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const BookDetailsPage = ({ onNotify }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data.data);
          setRelatedBooks(data.relatedBooks || []);
          setReviews(data.reviews || []);
          setQuantity(1);
        } else {
          navigate('/books');
        }
      } catch (err) {
        console.error('Failed to load book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '9999px', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading book details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Book Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>The book you are looking for does not exist or may have been removed.</p>
        <Link to="/books" className="btn btn-primary">Browse All Books</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => (item._id || item) === book._id);
  const isOutOfStock = book.stock <= 0;

  // Preserve database price as immutable unit price & calculate dynamic item total
  const unitPrice = Number(book.price) || 0;
  const itemTotalPrice = Math.round((unitPrice * quantity) * 100) / 100;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(book, quantity);
      if (onNotify) onNotify(`Added ${quantity} ${quantity > 1 ? 'copies' : 'copy'} of "${book.title}" to cart ($${itemTotalPrice.toFixed(2)})`, 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(book, quantity);
      navigate(isAuthenticated ? '/checkout' : '/cart');
    } catch (err) {
      if (onNotify) onNotify(err.message, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const added = await toggleWishlist(book._id);
      if (onNotify) onNotify(added ? 'Added to wishlist' : 'Removed from wishlist', 'info');
    } catch (err) {
      if (onNotify) onNotify(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onNotify) onNotify('Please sign in to write a review', 'error');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      if (onNotify) onNotify('Please write your review thoughts', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/books/${book._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        if (onNotify) onNotify('Thank you! Your review has been published.', 'success');
        setReviewComment('');
        // Refresh reviews
        const refreshRes = await fetch(`/api/books/${book._id}/reviews`);
        if (refreshRes.ok) {
          const revData = await refreshRes.json();
          setReviews(revData.data);
        }
        setBook(prev => ({
          ...prev,
          rating: data.bookRating,
          reviewsCount: data.reviewsCount
        }));
      } else {
        if (onNotify) onNotify(data.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      if (onNotify) onNotify('Network error while posting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        <Link to="/books" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'inherit' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <span>/</span>
        <Link to={`/books?category=${encodeURIComponent(book.category)}`} style={{ color: 'inherit' }}>
          {book.category}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main)', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </span>
      </div>

      {/* Main Book Overview Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '3rem', marginBottom: '5rem', alignItems: 'start' }}>
        {/* Book Cover Image Display */}
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '440px' }}>
            <img
              src={book.coverImage || generateTitleCoverSvg(book.title, book.author, book.category)}
              alt={book.title}
              data-title={book.title}
              data-author={book.author}
              data-category={book.category}
              onError={handleImageError}
              style={{ width: 'auto', maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: 'var(--radius-md)', filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2))' }}
            />
          </div>
        </div>

        {/* Book Purchasing & Metadata Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary">{book.category}</span>
            {book.isFeatured && <span className="badge badge-success">Featured Edition</span>}
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : book.stock <= 5 ? (
              <span className="badge badge-warning">Only {book.stock} Left in Stock</span>
            ) : (
              <span className="badge badge-success">In Stock ({book.stock} copies)</span>
            )}
          </div>

          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: '1.2', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
            {book.title}
          </h1>

          <div style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            By <strong style={{ color: 'var(--color-text-main)' }}>{book.author}</strong> ({book.year})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <RatingStars rating={book.rating || 0} reviewsCount={book.reviewsCount} size={18} />
            {book.isbn && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                ISBN: <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{book.isbn}</code>
              </div>
            )}
          </div>

          {/* Dynamic Item Total & Unit Pricing */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>
                ${itemTotalPrice.toFixed(2)}
              </div>
              {quantity > 1 && (
                <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  (${unitPrice.toFixed(2)} each)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>
                {itemTotalPrice >= 50 ? 'Free standard delivery on this item' : 'Free standard delivery on orders over $50'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Unit price: <strong>${unitPrice.toFixed(2)}</strong>{quantity > 1 ? ` × ${quantity} copies` : ''}
              </div>
            </div>
          </div>

          {/* Quantity Stepper and Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#ffffff', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                style={{ width: '2.5rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: quantity <= 1 || isOutOfStock ? 'var(--color-text-light)' : 'var(--color-text-main)', cursor: quantity <= 1 || isOutOfStock ? 'not-allowed' : 'pointer' }}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span style={{ width: '2.75rem', textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', userSelect: 'none' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.min(book.stock, prev + 1))}
                disabled={quantity >= book.stock || isOutOfStock}
                style={{ width: '2.5rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: quantity >= book.stock || isOutOfStock ? 'var(--color-text-light)' : 'var(--color-text-main)', cursor: quantity >= book.stock || isOutOfStock ? 'not-allowed' : 'pointer' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary"
              style={{ flex: 1, height: '2.75rem' }}
            >
              <ShoppingBag size={18} /> Add {quantity > 1 ? `${quantity} Copies` : 'to Cart'} • ${itemTotalPrice.toFixed(2)}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn btn-secondary"
              style={{ height: '2.75rem', background: '#f8fafc' }}
            >
              Instant Buy • ${itemTotalPrice.toFixed(2)}
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className="btn btn-secondary"
              style={{ height: '2.75rem', width: '2.75rem', padding: 0 }}
              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
            </button>
          </div>

          {/* Book Synopsis */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Overview & Synopsis</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', fontSize: '0.975rem' }}>
              {book.description || 'No detailed synopsis available for this volume.'}
            </p>
          </div>

          {/* Assurance perks */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={18} color="var(--color-primary)" /> Genuine Publisher Edition
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <Truck size={18} color="var(--color-primary)" /> Express Delivery Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={18} color="var(--color-primary)" /> 30-Day Hassle-Free Returns
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <CheckCircle2 size={18} color="var(--color-success)" /> Stock Verified
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem', marginBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem' }}>
          {/* Reviews list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <h2 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 700 }}>
                Reader Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                <MessageSquare size={32} color="var(--color-text-light)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>No reviews yet for this title. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.userName}</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <RatingStars rating={rev.rating} showCount={false} size={14} />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a review form */}
          <div>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Write a Reader Review
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Share your reading experience to help fellow bibliophiles find their next favorite book.
              </p>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{ padding: '0.25rem', color: star <= reviewRating ? '#f59e0b' : 'var(--color-border)', cursor: 'pointer' }}
                      >
                        <Star size={24} fill={star <= reviewRating ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review & Commentary</label>
                  <textarea
                    rows={4}
                    placeholder="What did you love about this book? How was the writing style, character development, or pacing?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Reader Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '2rem' }}>
            More in {book.category}
          </h2>
          <div className="book-grid">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id} book={relBook} onNotify={onNotify} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetailsPage;

