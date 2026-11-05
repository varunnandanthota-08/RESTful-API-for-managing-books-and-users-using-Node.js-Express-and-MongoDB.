import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, reviewsCount, showCount = true, size = 16 }) => {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rounded ? '#f59e0b' : (star - 0.5 <= rounded ? '#f59e0b' : 'none')}
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showCount && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {rating.toFixed(1)} {reviewsCount !== undefined && `(${reviewsCount})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

