import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit, Save, X, Calendar, MapPin, Lock, Package, Heart, Award, Truck, Gift, ShoppingBag, Clock, CheckCircle, XCircle, ChevronRight, Shield, CreditCard, Bell, LogOut, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    loyaltyPoints: 0,
    deliveredOrders: 0,
    recentActivity: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Pehle 'perfume_user' check karo, fir 'user' check karo
    const savedPerfumeUser = localStorage.getItem('perfume_user');
    const savedUser = localStorage.getItem('user');

    let userData = null;

    if (savedPerfumeUser) {
      userData = JSON.parse(savedPerfumeUser);
    } else if (savedUser) {
      const authUser = JSON.parse(savedUser);
      // Convert authUser format to perfume_user format
      const nameParts = authUser.name.split(' ');
      userData = {
        id: authUser.id,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authUser.email,
        phone: authUser.phone,
        password: '', // Not stored in authUser
        role: authUser.role,
        joinDate: new Date().toISOString().split('T')[0]
      };
      // Save it for future
      localStorage.setItem('perfume_user', JSON.stringify(userData));
    }

    if (userData) {
      setUser(userData);
      setEditedUser(userData);
      loadUserStats(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadUserStats = (userData: any) => {
    const userOrders = JSON.parse(localStorage.getItem(`orders_${userData.email}`) || '[]');
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userData.email}`) || '[]');

    const totalOrders = userOrders.length;
    const deliveredOrders = userOrders.filter((order: any) => order.status === 'delivered').length;
    const wishlistItems = userWishlist.length;
    const loyaltyPoints = totalOrders * 100 + deliveredOrders * 50 + wishlistItems * 10;

    const recentActivity = userOrders.slice(0, 4).map((order: any) => ({
      action: order.status === 'delivered' ? 'Order Delivered' :
        order.status === 'shipped' ? 'Order Shipped' :
          order.status === 'processing' ? 'Order Processing' :
            'Order Placed',
      time: order.date || 'Recently',
      status: order.status === 'delivered' ? 'Delivered' :
        order.status === 'cancelled' ? 'Cancelled' :
          'In Progress',
      orderId: order.id
    }));

    setUserStats({
      totalOrders,
      wishlistItems,
      loyaltyPoints,
      deliveredOrders,
      recentActivity
    });
  };

  const editViewAnimation = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: {
      stiffness: 100,
      damping: 15
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  // const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
  //   setShowPassword(prev => ({
  //     ...prev,
  //     [field]: !prev[field]
  //   }));
  // };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPassword({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleSaveChanges = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (editedUser.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(editedUser.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    localStorage.setItem('perfume_user', JSON.stringify(editedUser));
    setUser(editedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    setShowPassword({
      current: false,
      new: false,
      confirm: false
    });
    toast.success('Password changed successfully');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    // Saare user-related items clear karo
    localStorage.removeItem('perfume_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');

    toast.success('Logged out successfully');
    navigate('/', { replace: true });

    // Thoda delay deke reload (state clear karne ke liye)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const slideInVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-2 border-t-transparent border-gray-900 mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600"
          >
            Loading profile...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  const statsData = [
    {
      icon: Package,
      label: "Orders",
      value: userStats.totalOrders.toString(),
      color: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700",
      onClick: () => navigate('/orders')
    },
    {
      icon: Heart,
      label: "Wishlist",
      value: userStats.wishlistItems.toString(),
      color: "bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20",
      hoverColor: "hover:from-rose-600 hover:to-pink-700",
      onClick: () => navigate('/wishlist')
    },
    {
      icon: Award,
      label: "Rewards",
      value: userStats.loyaltyPoints.toLocaleString(),
      color: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20",
      hoverColor: "hover:from-amber-600 hover:to-orange-700",
      onClick: () => toast.info(`${userStats.loyaltyPoints} loyalty points earned!`)
    },
    {
      icon: Truck,
      label: "Delivered",
      value: userStats.deliveredOrders.toString(),
      color: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20",
      hoverColor: "hover:from-emerald-600 hover:to-green-700",
      onClick: () => navigate('/orders?status=delivered')
    }
  ];

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="text-amber-500" size={18} />;
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'cancelled': return <XCircle className="text-rose-500" size={18} />;
      default: return <Clock className="text-amber-500" size={18} />;
    }
  };

  const quickActions = [
    { label: "View Order History", path: "/orders", icon: Package },
    { label: "View All Wishlist", path: "/wishlist", icon: Heart },
    { label: "Account Settings", path: "/settings", icon: User },
    { label: "Payment Methods", path: "/payment-methods", icon: CreditCard },
    { label: "Notification Preferences", path: "/notifications", icon: Bell }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      {/* Modern Glass Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome, {isEditing ? editedUser.firstName : user.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account and view your activity
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dynamic Stats Cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${stat.color} ${stat.hoverColor} text-white rounded-2xl p-5 cursor-pointer transition-all duration-300`}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm opacity-90 font-medium">{stat.label}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                      className="p-2 bg-white/20 rounded-lg"
                    >
                      <stat.icon size={22} className="opacity-90" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Personal Information Card - Modern Glass Effect */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg">
                      <User size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h2>
                  </div>
                  {!isEditing ? (
                    <motion.button
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                      onClick={handleEditClick}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <motion.button
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      >
                        <X size={16} />
                        Cancel
                      </motion.button>
                      <motion.button
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={handleSaveChanges}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-lg transition-all shadow-lg shadow-gray-900/10"
                      >
                        <Save size={16} />
                        Save Changes
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative group"
                  >
                    <div className="relative w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-gray-800/5" />
                      <User size={56} className="text-gray-500 relative z-10" />
                    </div>
                    {isEditing && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Edit size={14} />
                      </motion.button>
                    )}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <div                        
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={editedUser.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                              />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={editedUser.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                              />
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          key="display-info"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <h3 className="text-2xl font-bold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-gray-600 mt-2">
                            Member since {user.joinDate || 'January 2024'}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <motion.span
                              whileHover={{ y: -2 }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium rounded-full shadow-sm"
                            >
                              Premium Member
                            </motion.span>
                            <motion.span
                              whileHover={{ y: -2 }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-700 text-xs font-medium rounded-full shadow-sm"
                            >
                              Verified Account
                            </motion.span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Contact Information Grid */}
                <motion.div variants={containerVariants} className="space-y-6">
                  {/* Contact Information */}
                  <motion.div variants={itemVariants}>
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail size={18} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Email Address</span>
                        </div>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div key="email-edit" {...editViewAnimation}>
                              <input
                                type="email"
                                name="email"
                                value={editedUser.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </motion.div>
                          ) : (
                            <motion.div key="email-view" {...editViewAnimation}>
                              <p className="font-medium text-gray-900">{user.email}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Phone */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone size={18} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Phone Number</span>
                        </div>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div key="phone-edit" {...editViewAnimation}>
                              <input
                                type="tel"
                                name="phone"
                                value={editedUser.phone || ""}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              />
                            </motion.div>
                          ) : (
                            <motion.div key="phone-view" {...editViewAnimation}>
                              <p className="font-medium text-gray-900">
                                {user.phone || "Not provided"}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Additional Information */}
                  <motion.div variants={itemVariants}>
                    <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date of Birth */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar size={18} className="text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Date of Birth</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dob"
                            value={editedUser.dob || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">
                            {user.dob || 'Not specified'}
                          </p>
                        )}
                      </motion.div>

                      {/* Location */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <MapPin size={18} className="text-amber-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Location</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={editedUser.location || ''}
                            onChange={handleInputChange}
                            placeholder="City, Country"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">
                            {user.location || 'Not specified'}
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Password Change Section */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut"
                        }}
                        className="pt-6 border-t border-gray-200"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center justify-between mb-4"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              className="p-2 bg-gray-100 rounded-lg"
                            >
                              <Lock size={18} className="text-gray-600" />
                            </motion.div>
                            <h3 className="font-semibold text-gray-900">Password Settings</h3>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05, x: 3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {isChangingPassword ? 'Cancel Change' : 'Change Password'}
                          </motion.button>
                        </motion.div>

                        <AnimatePresence mode="wait">
                          {isChangingPassword ? (
                            <motion.div
                              key="password-change-form"
                              initial={{ opacity: 0, y: -20, scale: 0.95 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: {
                                  type: "spring",
                                  stiffness: 100,
                                  damping: 15
                                }
                              }}
                              exit={{
                                opacity: 0,
                                y: -20,
                                scale: 0.95,
                                transition: {
                                  duration: 0.2
                                }
                              }}
                              className="space-y-6 p-6 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-500/5"
                            >
                              {/* Current Password */}
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Current Password
                                </label>
                                <div className="relative">
                                  <motion.input
                                    type={showPassword.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full px-4 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-all duration-200 pr-12 backdrop-blur-sm"
                                    placeholder="Enter current password"
                                    whileFocus={{
                                      scale: 1.01,
                                      borderColor: "#60A5FA",
                                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                    }}
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                    whileHover={{
                                      scale: 1.2,
                                      rotate: 5
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {showPassword.current ? (
                                      <EyeOff size={20} />
                                    ) : (
                                      <Eye size={20} />
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>

                              {/* New Passwords Grid */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                              >
                                {/* New Password */}
                                <motion.div
                                  whileHover={{ y: -2 }}
                                  className="space-y-3"
                                >
                                  <label className="block text-sm font-medium text-gray-700">
                                    New Password
                                  </label>
                                  <div className="relative">
                                    <motion.input
                                      type={showPassword.new ? "text" : "password"}
                                      value={passwordData.newPassword}
                                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                      className="w-full px-4 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-all duration-200 pr-12 backdrop-blur-sm"
                                      placeholder="Enter new password"
                                      whileFocus={{
                                        scale: 1.01,
                                        borderColor: "#60A5FA",
                                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                      }}
                                    />
                                    <motion.button
                                      type="button"
                                      onClick={() => togglePasswordVisibility('new')}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                      whileHover={{
                                        scale: 1.2,
                                        rotate: 5
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {showPassword.new ? (
                                        <EyeOff size={20} />
                                      ) : (
                                        <Eye size={20} />
                                      )}
                                    </motion.button>
                                  </div>
                                </motion.div>

                                {/* Confirm New Password */}
                                <motion.div
                                  whileHover={{ y: -2 }}
                                  className="space-y-3"
                                >
                                  <label className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                  </label>
                                  <div className="relative">
                                    <motion.input
                                      type={showPassword.confirm ? "text" : "password"}
                                      value={passwordData.confirmPassword}
                                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                      className="w-full px-4 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-all duration-200 pr-12 backdrop-blur-sm"
                                      placeholder="Confirm new password"
                                      whileFocus={{
                                        scale: 1.01,
                                        borderColor: "#60A5FA",
                                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                      }}
                                    />
                                    <motion.button
                                      type="button"
                                      onClick={() => togglePasswordVisibility('confirm')}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                      whileHover={{
                                        scale: 1.2,
                                        rotate: 5
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {showPassword.confirm ? (
                                        <EyeOff size={20} />
                                      ) : (
                                        <Eye size={20} />
                                      )}
                                    </motion.button>
                                  </div>
                                </motion.div>
                              </motion.div>

                              {/* Password Strength Indicator */}
                              {passwordData.newPassword && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="space-y-2"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                                    <span className={`text-xs font-bold ${passwordData.newPassword.length >= 8 ? 'text-emerald-600' :
                                        passwordData.newPassword.length >= 6 ? 'text-amber-600' :
                                          'text-rose-600'
                                      }`}>
                                      {passwordData.newPassword.length >= 8 ? 'Strong' :
                                        passwordData.newPassword.length >= 6 ? 'Medium' :
                                          'Weak'}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(passwordData.newPassword.length * 10, 100)}%` }}
                                      className={`h-full rounded-full ${passwordData.newPassword.length >= 8 ? 'bg-emerald-500' :
                                          passwordData.newPassword.length >= 6 ? 'bg-amber-500' :
                                            'bg-rose-500'
                                        }`}
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {/* Action Buttons */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-3 pt-2"
                              >
                                <motion.button
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  variants={{
                                    initial: { scale: 1 },
                                    hover: {
                                      scale: 1.05,
                                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                                    },
                                    tap: { scale: 0.95 }
                                  }}
                                  onClick={handlePasswordChange}
                                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex-1"
                                >
                                  <motion.span
                                    animate={{
                                      rotate: passwordData.newPassword !== passwordData.confirmPassword ? [0, 5, -5, 0] : 0
                                    }}
                                    transition={{ repeat: passwordData.newPassword !== passwordData.confirmPassword ? Infinity : 0, duration: 0.5 }}
                                  >
                                    <Lock size={18} />
                                  </motion.span>
                                  Update Password
                                </motion.button>

                                <motion.button
                                  whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "rg(243, 244, 246, 1)"
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleCancelEdit}
                                  className="px-8 py-3.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
                                >
                                  Cancel
                                </motion.button>
                              </motion.div>

                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xs text-gray-500 text-center pt-2"
                              >
                                Password must be at least 6 characters long with letters and numbers
                              </motion.p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="password-display"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                  type: "spring",
                                  stiffness: 100,
                                  damping: 15
                                }
                              }}
                              exit={{ opacity: 0, y: 20 }}
                              whileHover={{
                                y: -4,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)"
                              }}
                              className="p-5 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg"
                            >
                              <div className="flex items-center gap-4">
                                <motion.div
                                  whileHover={{ rotate: 15 }}
                                  className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner"
                                >
                                  <Lock size={20} className="text-gray-700" />
                                </motion.div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-gray-900">Current Password</p>
                                      <AnimatePresence mode="wait">
                                        {showCurrentPassword ? (
                                          <motion.div
                                            key="password-show"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center gap-3"
                                          >
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: "auto" }}
                                              className="font-mono text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg"
                                            >
                                              {user.password || 'DemoPassword123'}
                                            </motion.div>
                                            <motion.button
                                              whileHover={{ scale: 1.2 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => {
                                                navigator.clipboard.writeText(user.password || '');
                                                toast.success('Password copied to clipboard');
                                              }}
                                              className="text-gray-500 hover:text-blue-600"
                                              title="Copy to clipboard"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                              </svg>
                                            </motion.button>
                                          </motion.div>
                                        ) : (
                                          <motion.div
                                            key="password-hide"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-3"
                                          >
                                            <div className="flex space-x-1.5">
                                              {[...Array(8)].map((_, i) => (
                                                <motion.div
                                                  key={i}
                                                  initial={{ scale: 0.5, opacity: 0 }}
                                                  animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                    transition: {
                                                      delay: i * 0.05,
                                                      type: "spring",
                                                      stiffness: 200
                                                    }
                                                  }}
                                                  className="w-2.5 h-2.5 bg-gray-900 rounded-full"
                                                />
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <motion.button
                                      whileHover={{
                                        scale: 1.2,
                                        rotate: 10,
                                        backgroundColor: "rgba(243, 244, 246, 1)"
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="p-2.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                                      title={showCurrentPassword ? "Hide password" : "Show password"}
                                    >
                                      <AnimatePresence mode="wait">
                                        {showCurrentPassword ? (
                                          <motion.div
                                            key="eye-off"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                          >
                                            <EyeOff size={20} />
                                          </motion.div>
                                        ) : (
                                          <motion.div
                                            key="eye-on"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                          >
                                            <Eye size={20} />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.button>
                                  </div>

                                  <AnimatePresence>
                                    {showCurrentPassword && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <motion.div
                                          initial={{ y: -10 }}
                                          animate={{ y: 0 }}
                                          className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl"
                                        >
                                          <div className="flex items-start gap-2">
                                            <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                                            <p className="text-xs text-amber-800">
                                              <strong>Security Note:</strong> For your safety, never share your password with anyone. Consider changing it regularly.
                                            </p>
                                          </div>
                                        </motion.div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg">
                    <Clock size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <button
                  onClick={() => navigate('/orders')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>

              {userStats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {userStats.recentActivity.map((activity: any, index) => (
                    <motion.div
                      key={activity.orderId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${activity.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        activity.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {activity.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start shopping to see your recent activity here
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg"
                  >
                    Browse Products
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">Account Summary</h3>
              <div className="space-y-4">
                {[
                  { label: "Member Since", value: user.joinDate || 'Jan 2024', icon: Calendar },
                  { label: "Account Type", value: "Premium", icon: Award },
                  { label: "Verified Status", value: "Verified", icon: Shield },
                  { label: "Loyalty Points", value: userStats.loyaltyPoints.toLocaleString(), icon: Gift }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <item.icon size={16} className="text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className="flex items-center justify-between w-full text-left p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <action.icon size={16} className="text-gray-600" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Security Tips */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Shield className="text-blue-600" size={24} />
                </motion.div>
                <h3 className="font-semibold text-blue-900">Security Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Use a strong, unique password",
                  "Enable two-factor authentication",
                  "Never share your login details",
                  "Regularly update your password"
                ].map((tip, index) => (
                  <motion.li
                    key={tip}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start text-sm text-blue-800"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: index * 0.5 }}
                      className="mr-3 text-blue-600 font-bold"
                    >
                      •
                    </motion.span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div >
    </motion.div >
  );
};

export default Profile;