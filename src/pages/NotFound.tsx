import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Frown } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <Frown size={120} className="mx-auto text-gray-300" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back to the wonderful world of fragrances.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center"
          >
            <Home size={20} className="mr-2" />
            Back to Home
          </Link>
          
          <Link
            to="/products"
            className="btn-secondary inline-flex items-center justify-center"
          >
            <Search size={20} className="mr-2" />
            Browse Collection
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-16 flex space-x-4 opacity-20">
          {['🌸', '🌿', '🍊', '🌹', '🌲'].map((emoji, index) => (
            <div
              key={index}
              className="text-4xl animate-float"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;