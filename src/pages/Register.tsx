import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Check, Sparkles, Gift, Shield, Truck, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { registerUser } from 'api/api';


const API_BASE_URL = 'https://perfume-signaturefragrance-backend.vercel.app';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [socialRegister, setSocialRegister] = useState({
    facebook: false,
    google: false,
  });

  const [activeField, setActiveField] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocialRegister = async (platform: 'facebook' | 'google') => {
    setSocialRegister(prev => ({
      facebook: platform === 'facebook',
      google: platform === 'google'
    }));

    try {
      // Redirect to backend social auth endpoint
      window.location.href = `${API_BASE_URL}/auth/${platform}`;

      toast.success(`Redirecting to ${platform} authentication...`);
    } catch (error) {
      toast.error(`Failed to connect with ${platform}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      const result = response;
      console.log('Registration response:', result);
      // ✅ CORRECTION HERE: Access data from result.data
      if (result.success) {
        // Save user data and token in localStorage
        localStorage.setItem('perfume_user', JSON.stringify(result.user));
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('isLoggedIn', 'true');

        // Success animation
        toast.success(result.message || 'Registration successful! Welcome to PERFUME.');

        navigate('/profile', { replace: true });
      } else {
        console.error('Registration error:', result);
        throw new Error(result.message || 'Registration failed');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      toast.error(error.response.data.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const benefits = [
    { icon: Gift, title: "Exclusive Discounts", desc: "Get member-only pricing on all collections" },
    { icon: Clock, title: "Early Access", desc: "Be the first to experience new fragrances" },
    { icon: Truck, title: "Free Shipping", desc: "Enjoy free shipping on all orders" },
    { icon: Star, title: "Personalized Recommendations", desc: "Get tailored fragrance suggestions" },
    { icon: Sparkles, title: "Birthday Surprise", desc: "Special gift on your birthday" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -30, 30, -20, 20],
              x: [null, -20, 20, -10, 10],
              rotate: 360,
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative w-full max-w-6xl mx-auto p-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-gray-900 bg-clip-text text-transparent mb-4">
              CREATE ACCOUNT
            </h1>
            <motion.p
              className="text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Join our exclusive fragrance community
            </motion.p>
          </motion.div>
          <motion.div
            className="mt-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <Sparkles className="inline-block text-purple-500 animate-pulse" />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Registration Form */}
          <motion.div
            className="lg:col-span-2"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 md:p-10 relative overflow-hidden">
              {/* Animated border */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-8"
                variants={itemVariants}
              >
                Register Now
              </motion.h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your email *
                  </label>
                  <motion.div
                    className="relative"
                    animate={activeField === 'email' ? { scale: 1.005 } : {}}
                    transition={{ type: "spring" as const }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={20} className={`transition-colors ${activeField === 'email' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 hover:bg-white text-base shadow-sm hover:shadow-md"
                      placeholder="you@example.com"
                    />
                  </motion.div>
                </motion.div>

                {/* Username Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Username *
                  </label>
                  <motion.div
                    className="relative"
                    animate={activeField === 'username' ? { scale: 1.005 } : {}}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={20} className={`transition-colors ${activeField === 'username' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setActiveField('username')}
                      onBlur={() => setActiveField(null)}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 hover:bg-white text-base shadow-sm hover:shadow-md"
                      placeholder="Choose a username"
                    />
                  </motion.div>
                </motion.div>

                {/* Phone Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <motion.div
                    className="relative"
                    animate={activeField === 'phone' ? { scale: 1.005 } : {}}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={20} className={`transition-colors ${activeField === 'phone' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 hover:bg-white text-base shadow-sm hover:shadow-md"
                      placeholder="+1 (555) 123-4567"
                    />
                  </motion.div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Password *
                  </label>
                  <motion.div
                    className="relative"
                    animate={activeField === 'password' ? { scale: 1.005 } : {}}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={20} className={`transition-colors ${activeField === 'password' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setActiveField('password')}
                      onBlur={() => setActiveField(null)}
                      required
                      className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 hover:bg-white text-base shadow-sm hover:shadow-md"
                      placeholder="Create a strong password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-purple-600 transition-colors" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-purple-600 transition-colors" />
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Confirm Password *
                  </label>
                  <motion.div
                    className="relative"
                    animate={activeField === 'confirmPassword' ? { scale: 1.005 } : {}}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={20} className={`transition-colors ${activeField === 'confirmPassword' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setActiveField('confirmPassword')}
                      onBlur={() => setActiveField(null)}
                      required
                      className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 hover:bg-white text-base shadow-sm hover:shadow-md"
                      placeholder="Confirm your password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-purple-600 transition-colors" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-purple-600 transition-colors" />
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Terms and Conditions */}
                <motion.div
                  className="flex items-start pt-4"
                  variants={itemVariants}
                >
                  <motion.button
                    type="button"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg border mt-0.5 transition-all ${agreedToTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-400 hover:border-purple-400'
                      }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {agreedToTerms && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" as const }}
                      >
                        <Check size={16} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                  <div className="ml-4">
                    <label className="text-sm text-gray-700">
                      I agree to{' '}
                      <Link to="/terms" className="text-purple-600 hover:text-purple-800 font-semibold underline">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-gray-900 to-purple-900 text-white font-bold py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-700 to-gray-800"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="relative">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          CREATING ACCOUNT...
                        </div>
                      ) : (
                        <span className="text-lg">CREATE ACCOUNT <span className="ml-2">✨</span></span>
                      )}
                    </div>
                  </motion.button>
                </motion.div>

                {/* Login Link */}
                <motion.div
                  className="text-center pt-6"
                  variants={itemVariants}
                >
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-800 underline">
                      Sign in here
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Benefits */}
          <motion.div
            className="lg:col-span-1"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white rounded-3xl shadow-2xl p-8 md:p-10 h-full relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 border-2 border-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 5 + Math.random() * 5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative">
                <motion.h3
                  className="text-2xl font-bold mb-8 flex items-center"
                  variants={itemVariants}
                >
                  <Sparkles className="mr-3" />
                  Membership Benefits
                </motion.h3>

                <div className="space-y-6 mb-10">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      className="flex items-start bg-white/5 p-4 rounded-2xl backdrop-blur-sm"
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      transition={{ type: "spring" as const, stiffness: 300 }}
                    >
                      <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-4 flex-shrink-0"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <benefit.icon size={24} className="text-purple-300" />
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{benefit.title}</h4>
                        <p className="text-sm text-gray-300">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Account Security */}
                <motion.div
                  className="mt-10 pt-8 border-t border-white/20"
                  variants={itemVariants}
                >
                  <h4 className="font-semibold text-xl mb-6 flex items-center">
                    <Shield className="mr-3" />
                    Account Security
                  </h4>
                  <div className="space-y-4">
                    {[
                      "256-bit SSL encryption",
                      "Secure payment processing",
                      "Privacy protected data",
                      "Two-factor authentication"
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <motion.div
                          className="w-3 h-3 bg-green-400 rounded-full mr-3"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        />
                        <span className="text-sm text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Counter */}
                <motion.div
                  className="mt-10 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-center text-lg">
                    Join <motion.span
                      className="font-bold text-2xl text-white"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      5,000+
                    </motion.span> fragrance enthusiasts
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-600">
            By registering, you agree to PERFUME's{' '}
            <Link to="/terms" className="font-semibold text-purple-600 hover:text-purple-800">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-semibold text-purple-600 hover:text-purple-800">
              Privacy Policy
            </Link>
          </p>
          <motion.p
            className="mt-4 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            © 2024 PERFUME Signature Fragrances. All rights reserved.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;