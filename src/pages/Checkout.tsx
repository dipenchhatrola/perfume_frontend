import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';

const Checkout: React.FC = () => {
  const { cart, clearCart, cartItems } = useCart();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  // Animation controls for different sections
  const shippingRef = useRef(null);
  const paymentRef = useRef(null);
  const reviewRef = useRef(null);
  const summaryRef = useRef(null);
  
  const shippingInView = useInView(shippingRef, { once: true, amount: 0.3 });
  const paymentInView = useInView(paymentRef, { once: true, amount: 0.3 });
  const reviewInView = useInView(reviewRef, { once: true, amount: 0.3 });
  const summaryInView = useInView(summaryRef, { once: true, amount: 0.3 });
  
  const shippingControls = useAnimation();
  const paymentControls = useAnimation();
  const reviewControls = useAnimation();
  const summaryControls = useAnimation();

  // Animate sections when they come into view
  useEffect(() => {
    if (shippingInView) shippingControls.start('visible');
    if (paymentInView) paymentControls.start('visible');
    if (reviewInView) reviewControls.start('visible');
    if (summaryInView) summaryControls.start('visible');
  }, [shippingInView, paymentInView, reviewInView, summaryInView, shippingControls, paymentControls, reviewControls, summaryControls]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || 
          !formData.state || !formData.zipCode) {
        toast.error('Please fill all required fields');
        return false;
      }
    }
    
    // Validation for step 2
    if (step === 2 && paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvc) {
        toast.error('Please fill all payment details');
        return false;
      }
    }
    
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;
    
    // Create order object
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      orderDate: new Date().toISOString(), // Add this for consistency
      items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.total,
      products: cartItems, // Use products instead of items
      shipping: formData,
      paymentMethod: paymentMethod,
      status: 'pending', // Changed from 'processing' to 'pending'
    };
    
    // Save to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('perfume_orders') || '[]');
    const updatedOrders = [order, ...existingOrders];
    localStorage.setItem('perfume_orders', JSON.stringify(updatedOrders));
    
    // Clear cart
    clearCart();
    
    toast.success('Order placed successfully!');
    
    // Redirect to orders page
    setTimeout(() => {
      navigate('/orders');
    }, 1500);
  };

  const calculateShipping = () => {
    return cart.total > 50 ? 0 : 5.99;
  };

  const calculateTax = () => {
    return cart.total * 0.08;
  };

  const calculateTotal = () => {
    const shipping = calculateShipping();
    const tax = calculateTax();
    return cart.total + shipping + tax;
  };

  const handleNextStep = () => {
    if (!validateForm()) return;
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  const progressDotVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { 
      scale: 1.1, 
      opacity: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 300,
        damping: 15
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 pt-24 pb-12 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <h1 className="text-3xl font-serif font-bold mb-6">Checkout</h1>
            <p className="text-gray-600 mb-8">Your cart is empty. Add some products to proceed to checkout.</p>
            <Link
              to="/products"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition"
            >
              Browse Products
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pt-24 pb-12 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-serif font-bold mb-8"
        >
          Checkout
        </motion.h1>
        
        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {['Shipping', 'Payment', 'Review'].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div 
                  variants={progressDotVariants}
                  initial="initial"
                  animate={step >= index + 1 ? "animate" : "initial"}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step > index + 1 ? 'bg-green-500 text-white' :
                    step === index + 1 ? 'bg-black text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-sm font-medium ${
                    step >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {label}
                </motion.span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div 
                ref={shippingRef}
                variants={stepVariants}
                animate={shippingControls}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                <form className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>
                  </motion.div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
                    >
                      <ArrowLeft size={18} className="mr-2" />
                      Back to Cart
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition flex items-center"
                    >
                      Continue to Payment
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                ref={paymentRef}
                variants={stepVariants}
                animate={paymentControls}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {[
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: CreditCard },
                    { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                  ].map((method, index) => (
                    <motion.label
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === method.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-black focus:ring-black"
                      />
                      <div className="ml-3 flex items-center">
                        <method.icon size={20} className="mr-3" />
                        <span className="font-medium">{method.label}</span>
                      </div>
                    </motion.label>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          name="expiryDate"
                          value={paymentDetails.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVC *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          name="cvc"
                          value={paymentDetails.cvc}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Shipping
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                  >
                    Review Order
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                ref={reviewRef}
                variants={stepVariants}
                animate={reviewControls}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Order Review</h2>
                
                <div className="space-y-6">
                  {/* Shipping Info */}
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="font-semibold mb-3">Shipping Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p className="text-gray-600">{formData.email} | {formData.phone}</p>
                    </div>
                  </motion.div>

                  {/* Payment Info */}
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium capitalize">
                        {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                         paymentMethod === 'paypal' ? 'PayPal' : 
                         'Cash on Delivery'}
                      </p>
                      {paymentMethod === 'card' && (
                        <p className="text-gray-600 text-sm mt-1">
                          Card ending in {paymentDetails.cardNumber.slice(-4)}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Order Items */}
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-4">
                      {cart.items.map((item: any, index: number) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <motion.img
                              whileHover={{ rotate: 2 }}
                              src={item.img}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.family}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Payment
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePlaceOrder}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition flex items-center"
                  >
                    <Lock size={18} className="mr-2" />
                    Place Order
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div 
              ref={summaryRef}
              variants={stepVariants}
              initial="hidden"
              animate={summaryControls}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
            >
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-6"
              >
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cart.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{calculateShipping() === 0 ? 'Free' : `₹${calculateShipping().toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-t pt-4 mb-6"
              >
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 text-sm text-gray-600"
              >
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-green-600" />
                  Secure SSL encryption
                </div>
                <div className="flex items-center">
                  <Truck size={16} className="mr-2 text-blue-600" />
                  Delivery in 3-5 business days
                </div>
                <div className="flex items-center">
                  <Lock size={16} className="mr-2 text-gray-600" />
                  100% secure payment
                </div>
              </motion.div>
              
              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-green-800 text-sm text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;