import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  size = 20, 
  showNumber = false 
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return (
              <Star
                key={index}
                size={size}
                className="text-yellow-400 fill-current"
              />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <div key={index} className="relative">
                <Star
                  size={size}
                  className="text-gray-300"
                />
                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    size={size}
                    className="text-yellow-400 fill-current"
                  />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={index}
                size={size}
                className="text-gray-300"
              />
            );
          }
        })}
      </div>
      
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;