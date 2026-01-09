// pages/Cart.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Animation controls
  const controls = useAnimation();
  const emptyCartRef = React.useRef(null);
  const isInView = useInView(emptyCartRef, { once: true });
  const itemsRef = React.useRef<HTMLDivElement>(null);
  const itemsInView = useInView(itemsRef, { once: true, amount: 0.1 });

  // Animate empty cart state
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      });
    }
  }, [isInView, controls]);

  // Animate cart items when they come into view
  useEffect(() => {
    if (itemsInView) {
      const items = document.querySelectorAll('.cart-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
  }, [itemsInView]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Debug info
    console.log('=== Checkout Clicked ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));

    if (isAuthenticated) {
      // User is logged in, go to checkout
      console.log('User is authenticated, navigating to checkout');
      navigate('/checkout');
    } else {
      // User is not logged in, redirect to login
      console.log('User not authenticated, redirecting to login');

      // Save cart data temporarily
      localStorage.setItem('pendingCheckout', JSON.stringify({
        items: cartItems,
        total: totalPrice,
        timestamp: new Date().toISOString()
      }));

      // Redirect to login with return URL
      navigate('/checkout', {
        state: {
          from: '/checkout',
          message: 'Please login to complete your purchase'
        }
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-serif font-bold mb-8"
          >
            Your Cart
          </motion.h1>
          <div 
            ref={emptyCartRef}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={controls}
              className="flex flex-col items-center"
            >
              <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your cart is empty</h3>
              <p className="text-gray-600 mb-8">Add some perfumes to your cart and they will appear here.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition"
                >
                  Browse Collection
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-serif font-bold mb-8"
        >
          Your Cart ({totalItems} items)
        </motion.h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div ref={itemsRef} className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
                viewport={{ once: true, amount: 0.1 }}
                className="cart-item bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6"
                style={{ opacity: 0, transform: 'translateY(20px)' }}
              >
                <motion.img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-32 h-32 object-cover rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">{item.family}</p>
                      <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Remove
                        </motion.button>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="text-right"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-2xl font">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-gray-500">₹{item.price} each</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              className="flex justify-between items-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCart}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Cart
              </motion.button>
              
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/products"
                  className="text-gray-900 hover:text-black flex items-center"
                >
                  Continue Shopping
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-sm p-6 h-fit"
          >
            <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {[
                { label: 'Subtotal', value: `₹${totalPrice.toFixed(2)}` },
                { label: 'Shipping', value: 'Free' },
                { label: 'Tax', value: `₹${(totalPrice * 0.1).toFixed(2)}` }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between"
                >
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t pt-4 flex justify-between text-lg font-bold"
              >
                <span>Total</span>
                <span>₹{(totalPrice * 1.1).toFixed(2)}</span>
              </motion.div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`w-full ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-900'} text-white py-4 rounded-lg font-medium transition flex items-center justify-center`}
            >
              {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
              {cartItems.length > 0 && <ArrowRight size={20} className="ml-2" />}
            </motion.button>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-gray-500 text-center mt-4"
            >
              Free shipping on all orders. Tax calculated at checkout.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;