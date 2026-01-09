import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, Package } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  inStock?: boolean;
  description?: string;
  fragranceNotes?: { top: string[], middle: string[], base: string[] };
  size?: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  stockQuantity?: number;
  gender?: string;
  concentration?: string;
}

const Wishlist: React.FC = () => {
  const { addToCart } = useCart();
  const { wishlist: globalWishlist, removeFromWishlist } = useWishlist();
  const [userWishlist, setUserWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('perfume_user');
    
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    const userWishlistData = JSON.parse(localStorage.getItem(`wishlist_${userData.email}`) || '[]');
    
    if (userWishlistData.length === 0 && globalWishlist.length > 0) {
      setUserWishlist(globalWishlist);
    } else {
      setUserWishlist(userWishlistData);
    }
    
    setLoading(false);
  }, [navigate, globalWishlist]);

  const handleAddToCart = (item: WishlistProduct) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
      category: item.category || 'Unisex',
      description: item.description || 'Premium fragrance',
      fragranceNotes: item.fragranceNotes || { top: [], middle: [], base: [] },
      size: item.size || '100ml',
      rating: item.rating || 4.5,
      reviewsCount: item.reviewsCount || 100,
      images: [item.imageUrl],
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      stockQuantity: item.stockQuantity || 10,
      inStock: item.inStock !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredients: [],
      occasion: [],
      season: [],
      longevity: 8,
      sillage: 5,
      gender: item.gender || 'unisex',
      concentration: item.concentration || 'EDP',
      subCategory: [],
      longDescription: '',
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    
    const savedUser = localStorage.getItem('perfume_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const userWishlistData = JSON.parse(localStorage.getItem(`wishlist_${userData.email}`) || '[]');
      const updatedWishlist = userWishlistData.filter((item: WishlistProduct) => item.id !== id);
      localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify(updatedWishlist));
      setUserWishlist(updatedWishlist);
    }
    
    toast.success('Removed from wishlist');
  };

  const handleClearWishlist = () => {
    const savedUser = localStorage.getItem('perfume_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify([]));
      setUserWishlist([]);
    }
    toast.success('Wishlist cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading your wishlist...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-3">
              My Wishlist
              <span className="ml-4 text-lg text-gray-500 font-normal">
                ({userWishlist.length} {userWishlist.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Save your favorite fragrances and get notified about price drops and restocks.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {userWishlist.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearWishlist}
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Clear All
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="px-5 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {userWishlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 lg:py-24 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart size={80} className="mx-auto text-gray-300 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist feels lonely</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Start exploring our premium fragrance collection and save your favorites here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  Browse Collection
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/collections/new')}
                  className="px-6 py-3 border-2 border-black text-black rounded-lg font-medium hover:bg-black hover:text-white transition"
                >
                  New Arrivals
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Wishlist Items */}
              <div className="lg:col-span-2 space-y-6">
                {userWishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="md:w-48 lg:w-56 relative overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemove(item.id)}
                            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl"
                            title="Remove"
                          >
                            <Trash2 size={18} className="text-gray-700" />
                          </motion.button>
                          
                          {item.inStock === false && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        
                        {item.category && (
                          <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                            {item.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Details Section */}
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{item.brand}</p>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">${item.price}</span>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${i < (item.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({item.reviewsCount || 128})
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package size={16} />
                              <span>{item.size || '100ml'} • {item.concentration || 'EDP'}</span>
                            </div>
                          </div>
                          
                          {item.fragranceNotes && (
                            <div className="mb-6">
                              <p className="text-sm font-medium text-gray-700 mb-2">Fragrance Notes:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.fragranceNotes.top.slice(0, 2).map((note, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                    {note}
                                  </span>
                                ))}
                                {item.fragranceNotes.middle.slice(0, 2).map((note, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
                                    {note}
                                  </span>
                                ))}
                                {item.fragranceNotes.base.slice(0, 2).map((note, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddToCart(item)}
                            disabled={item.inStock === false}
                            className={`flex-1 py-3 rounded-lg font-medium transition ${
                              item.inStock !== false
                                ? 'bg-black hover:bg-gray-800 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {item.inStock !== false ? 'Add to Cart' : 'Out of Stock'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="flex-1 py-3 border-2 border-black text-black rounded-lg font-medium hover:bg-black hover:text-white transition"
                          >
                            View Details
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                    Wishlist Summary
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Items</span>
                      <span className="font-medium">{userWishlist.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Value</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${userWishlist.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Stock</span>
                      <span className="font-medium text-green-600">
                        {userWishlist.filter(item => item.inStock !== false).length} items
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => userWishlist.filter(item => item.inStock !== false).forEach(item => handleAddToCart(item))}
                    className="w-full py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg font-medium mb-4 hover:from-gray-800 hover:to-black transition"
                  >
                    Add All to Cart (${userWishlist.filter(item => item.inStock !== false).reduce((sum, item) => sum + item.price, 0).toFixed(2)})
                  </motion.button>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">You might also like</h4>
                    {userWishlist.slice(0, 2).map(item => (
                      <Link
                        key={`suggest-${item.id}`}
                        to={`/product/${item.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-black">{item.name}</p>
                          <p className="text-sm text-gray-600">${item.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      Save items to your wishlist to track availability and receive notifications.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart size={16} className="text-red-500" />
                      <span>Your wishlist is private and secure</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;