import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../utils/imageHelper';

const BookCard = ({ book, onNotify }) => {
  const { wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const isWishlisted = wishlist.some(id => (id._id || id) === book._id);
  const isOutOfStock = book.stock <= 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = await toggleWishlist(book._id);
      if (onNotify) {
        onNotify(added ? 'Saved to your wishlist' : 'Removed from wishlist', 'info');
      }
    } catch (err) {
      if (onNotify) onNotify(err.message, 'error');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    try {
      await addToCart(book, 1);
      if (onNotify) onNotify(`"${book.title}" added to cart!`, 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message, 'error');
    }
  };

  return (
    <div className="book-card">
      <Link to={`/books/${book._id}`} className="book-cover-wrap">
        <img
          src={book.coverImage || generateTitleCoverSvg(book.title, book.author, book.category)}
          alt={book.title}
          data-title={book.title}
          data-author={book.author}
          data-category={book.category}
          className="book-cover-img"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Stock Status Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 4 }}>
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : book.stock <= 5 ? (
            <span className="badge badge-warning">Only {book.stock} left</span>
          ) : book.isFeatured ? (
            <span className="badge badge-primary">Featured</span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
        </button>
      </Link>

      <div className="book-card-body">
        <div className="book-card-category">{book.category}</div>
        <Link to={`/books/${book._id}`} className="book-card-title" title={book.title}>
          {book.title}
        </Link>
        <div className="book-card-author">by {book.author}</div>

        <div style={{ marginBottom: '0.75rem' }}>
          <RatingStars rating={book.rating || 0} reviewsCount={book.reviewsCount} size={14} />
        </div>

        <div className="book-card-footer">
          <div className="book-card-price">${Number(book.price).toFixed(2)}</div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn btn-primary btn-sm"
            title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
          >
            <ShoppingBag size={15} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
