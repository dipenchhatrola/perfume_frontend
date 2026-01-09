import { useState, useEffect } from 'react';
import { ShoppingBag, Filter, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
//import axios from 'axios';

// ✅ Correct API URL - same as AdminProducts.tsx
//const API_BASE_URL = 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  family: string;
  quantity: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const ProductsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, totalItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Correct API call - same as AdminProducts.tsx
      const response = await api.get('/api/product');

      console.log('API Response:', response.data);

      if (response.data.success) {
        const fetchedProducts = response.data.products || [];

        // ✅ Ensure image URLs are properly formatted
        const productsWithFullUrls = fetchedProducts.map((product: Product) => ({
          ...product,
          // Add base URL if image path is relative
          image: product.image.startsWith('http')
            ? product.image
            : `${process.env.REACT_APP_API_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
        }));

        console.log('Processed products:', productsWithFullUrls);
        setProducts(productsWithFullUrls);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product: Product) => {
    // Convert API product to cart product format
    const cartProduct = {
      id: product._id,
      name: product.name,
      family: product.family,
      price: product.price,
      img: product.image,
      rating: product.rating,
      quantity: 1
    };

    addToCart(cartProduct);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product: Product) => {
    const isProductInWishlist = isInWishlist(product._id);

    if (isProductInWishlist) {
      removeFromWishlist(product._id);
      toast.success(`${product.name} removed from wishlist!`);
    } else {
      const wishlistItem = {
        id: product._id,
        name: product.name,
        brand: product.family,
        price: product.price,
        imageUrl: product.image,
        inStock: product.quantity > 0,
      };

      addToWishlist(wishlistItem);
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  // Filter products based on active category
  const filteredProducts = products.filter(p =>
    activeCategory === 'All' || p.family === activeCategory
  );

  // All categories from products
  const allCategories = ['All', ...Array.from(new Set(products.map(p => p.family)))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      y: -8,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.4,
        type: "tween" as const
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    hover: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const heartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300
      }
    }
  };

  const categoryVariants = {
    active: {
      color: "#000000",
      fontWeight: 600,
      x: 4,
      transition: {
        type: "spring" as const,
        stiffness: 300
      }
    },
    inactive: {
      color: "#57534e",
      x: 0
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#FDFCFB] pt-24 pb-12 px-6 flex justify-center items-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-stone-600">Loading fragrances...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#FDFCFB] pt-24 pb-12 px-6 flex justify-center items-center"
      >
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Failed to Load Products</h3>
          <p className="text-stone-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-black text-white px-6 py-2 rounded hover:bg-stone-800 transition"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FDFCFB] pt-24 pb-12 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full lg:w-64 space-y-8"
        >
          <div>
            <motion.h3
              whileHover={{ x: 2 }}
              className="text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center"
            >
              <Filter className="w-3 h-3 mr-2" /> Categories
            </motion.h3>
            <ul className="space-y-3 text-sm">
              {allCategories.map(cat => (
                <motion.li
                  key={cat}
                  variants={categoryVariants}
                  initial="inactive"
                  animate={activeCategory === cat ? "active" : "inactive"}
                  whileHover={{ x: 2 }}
                  className={`cursor-pointer transition ${activeCategory === cat ? 'text-black font-semibold' : 'text-stone-600'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className="text-xs text-stone-400 ml-2">
                    ({cat === 'All' ? products.length : products.filter(p => p.family === cat).length})
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.aside>

        {/* Product Grid */}
        <main className="flex-1">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <span className="text-xs text-stone-400 uppercase tracking-widest">
                {filteredProducts.length} Fragrances
              </span>
              {activeCategory !== 'All' && (
                <p className="text-sm text-stone-600 mt-1">
                  Showing {activeCategory} category products
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/wishlist"
                  className="text-xs uppercase tracking-widest hover:text-black transition flex items-center"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Wishlist
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/cart"
                  className="text-xs uppercase tracking-widest hover:text-black transition flex items-center"
                >
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  Cart ({totalItems})
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-stone-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">No Products Found</h3>
                <p className="text-stone-600 mb-6">
                  {activeCategory === 'All'
                    ? 'No products available'
                    : `No products found in "${activeCategory}" category`
                  }
                </p>
                {activeCategory !== 'All' && (
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-stone-800 transition"
                  >
                    View All Products
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16"
              >
                {filteredProducts.map((product) => {
                  const isProductInWishlist = isInWishlist(product._id);

                  return (
                    <motion.div
                      key={product._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className="group flex flex-col"
                    >
                      {/* Image Container */}
                      <motion.div
                        variants={imageVariants}
                        className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-6"
                      >
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          onError={(e) => {
                            // Fallback image if original fails to load
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop';
                          }}
                        />

                        {/* Stock Badge */}
                        {product.quantity <= 0 && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs uppercase tracking-widest">
                            Out of Stock
                          </div>
                        )}

                        {/* Hover Actions */}
                        <motion.div
                          variants={buttonVariants}
                          initial="hidden"
                          whileHover="hover"
                          className="absolute inset-0 bg-black/5 flex items-end p-4"
                        >
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleQuickAdd(product)}
                            disabled={product.quantity <= 0}
                            className={`w-full py-3 text-xs uppercase tracking-widest transition duration-300 shadow-xl ${product.quantity <= 0
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-black hover:text-white'
                              }`}
                          >
                            {product.quantity <= 0 ? 'Out of Stock' : 'Quick Add'}
                          </motion.button>
                        </motion.div>

                        {/* Wishlist Button */}
                        <motion.button
                          variants={heartVariants}
                          initial="hidden"
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleWishlistToggle(product)}
                          className={`absolute top-4 right-4 p-2 backdrop-blur-sm rounded-full ${isProductInWishlist
                              ? 'bg-red-500/90 hover:bg-red-600'
                              : 'bg-white/80 hover:bg-white'
                            } transition-colors duration-300`}
                        >
                          <Heart className={`w-4 h-4 ${isProductInWishlist
                              ? 'fill-white text-white'
                              : 'text-stone-600'
                            }`} />
                        </motion.button>
                      </motion.div>

                      {/* Details */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
                            {product.family}
                          </p>
                          <motion.h2
                            whileHover={{ x: 2 }}
                            className="text-lg font-serif mb-2"
                          >
                            {product.name}
                          </motion.h2>
                          <div className="flex items-center space-x-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Star className={`w-3 h-3 ${i < product.rating ? 'fill-stone-800' : 'text-stone-300'}`} />
                              </motion.div>
                            ))}
                            <span className="text-xs text-stone-500 ml-1">
                              ({product.rating})
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mb-1">
                            Stock: {product.quantity}
                          </p>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="font text-lg"
                        >
                          ₹{product.price}
                        </motion.span>
                      </div>

                      {/* Product Description */}
                      <p className="text-sm text-stone-600 mt-2 line-clamp-2">
                        {product.description || 'Premium fragrance with exquisite notes.'}
                      </p>

                      {/* Add to Cart Button (Visible on mobile) */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAdd(product)}
                        disabled={product.quantity <= 0}
                        className={`md:hidden mt-4 py-2 text-xs uppercase tracking-widest transition ${product.quantity <= 0
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-stone-800'
                          }`}
                      >
                        {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default ProductsPage;