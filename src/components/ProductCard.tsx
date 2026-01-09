import React from 'react';
import { Perfume } from '../types/perfume';
import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext'; // NEW

interface ProductCardProps {
  perfume: Perfume;
  onAddToCart: (perfume: Perfume) => void;
  onToggleWishlist?: (perfume: Perfume) => void; // NEW
}

const ProductCard: React.FC<ProductCardProps> = ({ perfume, onAddToCart, onToggleWishlist }) => {
  const { isInWishlist } = useWishlist(); // NEW

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative">
      <div className="relative">
        <img
          src={perfume.imageUrl}
          alt={perfume.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Wishlist Heart Button - UPDATED */}
        <button 
          onClick={() => onToggleWishlist && onToggleWishlist(perfume)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
        >
          <Heart 
            size={20} 
            className={isInWishlist(perfume.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'} // RED when in wishlist
          />
        </button>
        {!perfume.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{perfume.name}</h3>
            <p className="text-gray-600 text-sm">{perfume.brand}</p>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
            {perfume.category}
          </span>
        </div>
        
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < perfume.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({perfume.rating})</span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{perfume.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-purple-700">${perfume.price}</span>
          <span className="text-sm text-gray-500">{perfume.size}</span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Link
            to={`/product/${perfume.id}`}
            className="flex-1 text-center py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition"
          >
            View Details
          </Link>
          <button
            onClick={() => onAddToCart(perfume)}
            disabled={!perfume.inStock}
            className={`flex-1 py-2 rounded transition ${
              perfume.inStock
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;