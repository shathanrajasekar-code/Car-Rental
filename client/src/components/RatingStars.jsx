import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, interactive = false, onRatingChange, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <Star
            key={star}
            size={size}
            className={`${
              isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
