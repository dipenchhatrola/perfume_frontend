// pages/Settings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Bell, Lock, Globe, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    orderUpdates: true,
    newArrivals: true,
    language: 'en',
    timezone: 'EST',
    twoFactorAuth: false
  });
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSaveSettings = () => {
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (password.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setPassword({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully');
    }, 1000);
  };

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
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div 
          className="mb-10 md:mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate('/profile')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Profile
            </motion.button>
            {/* <div className="text-right">
              <p className="text-sm text-gray-500">Account Settings</p>
              <p className="text-xs text-gray-400">Last updated: Today</p>
            </div> */}
          </div>          
          <div>
            <h1 className="text-3xl font-serif font-light tracking-wide">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Manage your notification preferences, security settings, and account preferences in one place.
            </p>            
          </div>
          
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Notification Settings */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-50 rounded-xl mr-4">
                  <Bell className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-gray-600 mt-1">Control how we communicate with you</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {Object.entries({
                  emailNotifications: 'Email Notifications',
                  marketingEmails: 'Marketing Emails',
                  orderUpdates: 'Order Updates',
                  newArrivals: 'New Arrivals'
                }).map(([key, label], index) => (
                  <motion.div 
                    key={key} 
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{label}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${settings[key as keyof typeof settings] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {settings[key as keyof typeof settings] ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {key === 'emailNotifications' && 'Receive important account notifications'}
                        {key === 'marketingEmails' && 'Promotions, discounts, and special offers'}
                        {key === 'orderUpdates' && 'Shipping updates and delivery notifications'}
                        {key === 'newArrivals' && 'Get notified about new perfume launches'}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }))}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-4 ${settings[key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-300'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ${settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`}
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-red-50 rounded-xl mr-4">
                  <Lock className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security</h2>
                  <p className="text-gray-600 mt-1">Protect your account with advanced security</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-6 text-lg">Change Password</h3>
                  <div className="space-y-6">
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label, index) => {
                      const getInputType = () => {
                        if (label === 'Current Password') {
                          return showCurrent ? 'text' : 'password';
                        }
                        if (label === 'New Password') {
                          return showNew ? 'text' : 'password';
                        }
                        return showConfirm ? 'text' : 'password';
                      };

                      const getInputValue = () => {
                        if (label === 'Current Password') return password.current;
                        if (label === 'New Password') return password.new;
                        return password.confirm;
                      };

                      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        if (label === 'Current Password') {
                          setPassword(prev => ({ ...prev, current: value }));
                        } else if (label === 'New Password') {
                          setPassword(prev => ({ ...prev, new: value }));
                        } else {
                          setPassword(prev => ({ ...prev, confirm: value }));
                        }
                      };

                      const toggleVisibility = () => {
                        if (label === 'Current Password') setShowCurrent(!showCurrent);
                        else if (label === 'New Password') setShowNew(!showNew);
                        else setShowConfirm(!showConfirm);
                      };

                      const getEyeIcon = () => {
                        const isVisible = label === 'Current Password' ? showCurrent : 
                                        label === 'New Password' ? showNew : showConfirm;
                        return isVisible ? <EyeOff size={20} /> : <Eye size={20} />;
                      };

                      return (
                        <motion.div
                          key={label}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + (index * 0.05) }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {label}
                          </label>
                          <div className="relative">
                            <input
                              type={getInputType()}
                              value={getInputValue()}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                              placeholder={`Enter your ${label.toLowerCase()}`}
                            />
                            <motion.button
                              type="button"
                              onClick={toggleVisibility}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {getEyeIcon()}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    <motion.button
                      onClick={handlePasswordChange}
                      disabled={!password.current || !password.new || !password.confirm || updatingPassword}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {updatingPassword ? (
                        <span className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating Password...
                        </span>
                      ) : 'Update Password'}
                    </motion.button>
                  </div>
                </div>
                
                {/* <motion.div 
                  className="pt-8 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${settings.twoFactorAuth ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {settings.twoFactorAuth ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <motion.button
                      onClick={() => setSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-400'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`}
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                  {settings.twoFactorAuth && (
                    <motion.div 
                      className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Check className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Two-factor authentication enabled</p>
                          <p className="text-sm text-green-700 mt-1">
                            Your account is now protected with an additional security layer.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div> */}
              </div>
            </motion.div>
          </motion.div>

          {/* Preferences Sidebar */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Preferences */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-50 rounded-xl mr-4">
                  <Globe className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                  <p className="text-gray-600 text-sm mt-1">Regional settings</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { 
                    key: 'language', 
                    label: 'Language', 
                    value: settings.language, 
                    icon: '🌐',
                    options: [
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                      { value: 'fr', label: 'Français' },
                      { value: 'de', label: 'Deutsch' }
                    ] 
                  },
                  { 
                    key: 'timezone', 
                    label: 'Timezone', 
                    value: settings.timezone, 
                    icon: '🕐',
                    options: [
                      { value: 'EST', label: 'Eastern Time (EST)' },
                      { value: 'CST', label: 'Central Time (CST)' },
                      { value: 'MST', label: 'Mountain Time (MST)' },
                      { value: 'PST', label: 'Pacific Time (PST)' }
                    ] 
                  }
                ].map((pref, index) => (
                  <motion.div
                    key={pref.key}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">{pref.icon}</span>
                      {pref.label}
                    </label>
                    <motion.select
                      value={pref.value}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        [pref.key]: e.target.value 
                      }))}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      whileFocus={{ scale: 1.02 }}
                    >
                      {pref.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </motion.select>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Save Card */}
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-gray-800 rounded-xl mb-4">
                  <Save className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Save All Changes</h3>
                <p className="text-gray-300 text-sm">
                  Apply your settings across all devices
                </p>
              </div>
              
              <motion.button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full bg-white text-gray-900 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {savingSettings ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving Changes...
                  </span>
                ) : (
                  <>
                    <Save size={20} className="mr-3" />
                    Save All Settings
                  </>
                )}
              </motion.button>
              
              <p className="text-gray-400 text-xs text-center mt-4">
                Your changes will be applied immediately
              </p>
            </motion.div>

            {/* Info Card */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-bold text-gray-900 mb-3">💡 Need Help?</h4>
              <p className="text-sm text-gray-700 mb-4">
                If you have questions about your settings, check our help center or contact support.
              </p>
              <motion.button
                className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Visit Help Center →
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;