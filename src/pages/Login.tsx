import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Check, Phone, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SMSService from '../services/SMSService';
import { loginUser } from 'api/api';

// Define user type for authentication
interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
}

// OTP verification component
const OTPVerification = ({
  phoneNumber,
  onVerify,
  onResend,
  onCancel,
  isLoading
}: {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      await onVerify(otpCode);
    } catch (error) {
      // Error is already handled in parent component
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent successfully!');
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <Send size={16} className="text-green-500" />
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Verify OTP</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Enter the 6-digit code sent to
          </p>
          <p className="font-semibold text-gray-900 mt-1">+91 {phoneNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
              ) : (
                `Resend OTP in ${timer}s`
              )}
            </p>
            <p className="text-xs text-gray-500">
              OTP is valid for 10 minutes
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFieldFocused, setIsFieldFocused] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === 'phone') {
      const phoneValue = e.target.value.replace(/\D/g, '').slice(0, 10);
      setLoginData({
        ...loginData,
        [e.target.name]: phoneValue,
      });
    } else {
      setLoginData({
        ...loginData,
        [e.target.name]: e.target.value,
      });
    }
  }

  const getAllUsers = () => {
    try {
      const usersData = localStorage.getItem('perfume_users');
      if (usersData) {
        return JSON.parse(usersData);
      }

      const singleUser = localStorage.getItem('perfume_user');
      if (singleUser) {
        return [JSON.parse(singleUser)];
      }

      return [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  const findUserByPhone = (phone: string) => {
    const users = getAllUsers();
    return users.find((u: any) => {
      const userPhone = u.phone || u.mobile || u.phoneNumber;
      return userPhone && userPhone.replace(/\D/g, '') === phone.replace(/\D/g, '');
    });
  };

  const authenticateUser = (email: string, password: string): AuthResult => {
    const users = getAllUsers();
    const user = users.find((u: any) =>
      u.email && u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const inputPassword = password.trim();
    const storedPassword = String(user.password || '').trim();

    if (storedPassword !== inputPassword) {
      return { success: false, message: 'Incorrect password' };
    }

    return {
      success: true,
      user: {
        id: user.id || user.email,
        name: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.name || user.username || user.email.split('@')[0],
        email: user.email,
        phone: user.phone || user.mobile,
        role: user.role || 'user'
      }
    };
  };

  const handlePhoneLogin = async () => {
    if (!loginData.phone || loginData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Check if user exists in localStorage
    const user = findUserByPhone(loginData.phone);
    if (!user) {
      // In production, you might want to call backend to check if phone exists
      toast.error('No account found with this phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Use SMSService to send OTP
      const sent = await SMSService.sendOTP(loginData.phone);

      if (sent) {
        setOtpPhoneNumber(loginData.phone);
        setShowOtpVerification(true);
        toast.success('OTP sent successfully!');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!otpPhoneNumber) return;

    try {
      const sent = await SMSService.sendOTP(otpPhoneNumber);
      if (sent) {
        toast.success('OTP resent successfully!');
      } else {
        toast.error('Failed to resend OTP');
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
      throw error;
    }
  };

  const handleOtpVerify = async (otp: string) => {
    setOtpVerificationLoading(true);

    try {
      // Use SMSService to verify OTP
      const verified = await SMSService.verifyOTP(otpPhoneNumber, otp);

      if (verified) {
        // Find user in localStorage
        const user = findUserByPhone(otpPhoneNumber);

        if (!user) {
          toast.error('User not found');
          setOtpVerificationLoading(false);
          return;
        }

        const mockToken = `jwt_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        const authUser: AuthUser = {
          id: user.id || user.email,
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.name || user.username || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.phone || user.mobile,
          role: user.role || 'user',
          token: mockToken
        };

        // ✅ Create perfume_user format for Profile.tsx
        const perfumeUser = {
          id: user.id || user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || 'User',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || user.mobile,
          password: user.password || '',
          role: user.role || 'user',
          joinDate: user.joinDate || new Date().toISOString().split('T')[0]
        };

        // Store session
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('perfume_user', JSON.stringify(perfumeUser));
        localStorage.setItem('isLoggedIn', 'true');

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', authUser.email || '');
        }

        toast.success(`Welcome back, ${authUser.name}!`);

        // Confetti effect
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then((confettiModule) => {
            const confetti = confettiModule.default;
            const end = Date.now() + 1000;
            const colors = ['#a855f7', '#ec4899', '#f59e0b'];

            (function frame() {
              if (Date.now() > end) return;

              confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
              });

              confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
              });

              requestAnimationFrame(frame);
            }());
          });
        }

        const from = (location.state as any)?.from || '/profile';
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);

        setShowOtpVerification(false);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginMethod === 'phone') {
      // Handle phone OTP login
      await handlePhoneLogin();
      return;
    }

    // Handle email login
    setIsLoading(true);

    try {
      const authResult = await loginUser({ email: loginData.email, password: loginData.password });
      console.log('Authentication result:', authResult);

      if (!authResult.success) {
        toast.error(authResult.message || 'Invalid credentials');
        return;
      }

      // Create mock token and session
      const mockToken = authResult.token || `jwt_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      const authUser = authResult.user!;

      // ✅ Create perfume_user format for Profile.tsx
      const nameParts = authUser.name.split(' ');
      const perfumeUser = {
        id: authUser.id,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authUser.email,
        phone: authUser.phone,
        password: loginData.password,
        role: authUser.role,
        joinDate: new Date().toISOString().split('T')[0]
      };

      // Store session
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('perfume_user', JSON.stringify(perfumeUser));
      localStorage.setItem('isLoggedIn', 'true');

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', authUser.email || '');
      }

      toast.success(`Welcome back, ${authUser.name}!`);

      // Confetti effect
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default;
          const end = Date.now() + 1000;
          const colors = ['#a855f7', '#ec4899', '#f59e0b'];

          (function frame() {
            if (Date.now() > end) return;

            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
            });

            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
            });

            requestAnimationFrame(frame);
          }());
        });
      }

      const from = (location.state as any)?.from || '/profile';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 300);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // For testing - create a test user if none exists
  useEffect(() => {
    const testUsers = getAllUsers();
    if (testUsers.length === 0) {
      const testUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'user',
        joinDate: '2024-01-01'
      };
      localStorage.setItem('perfume_users', JSON.stringify([testUser]));
      console.log('Test user created for testing');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -30, 30, -20, 20],
              x: [null, -20, 20, -10, 10],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <main className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="w-full max-w-md relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Floating Logo */}
          <motion.div
            className="text-center mb-10"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-light tracking-widest bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                PERFUME
              </h1>
              <motion.p
                className="text-gray-500 mt-2 text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Signature Fragrances
              </motion.p>
            </motion.div>
            <motion.div
              className="mt-2 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <Sparkles size={20} className="text-purple-500" />
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8 md:p-10 relative overflow-hidden"
            variants={itemVariants}
            whileHover={{
              boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
              y: -5
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* OTP Verification Overlay */}
            <AnimatePresence>
              {showOtpVerification && (
                <OTPVerification
                  phoneNumber={otpPhoneNumber}
                  onVerify={handleOtpVerify}
                  onResend={handleResendOTP}
                  onCancel={() => setShowOtpVerification(false)}
                  isLoading={otpVerificationLoading}
                />
              )}
            </AnimatePresence>

            {/* Animated border effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="relative">
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                variants={itemVariants}
              >
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-gray-800"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome Back
                </motion.h2>
                <motion.p
                  className="text-gray-600 mt-2 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Sign in to your account
                </motion.p>
              </motion.div>

              {/* Login Method Toggle */}
              <motion.div
                className="flex mb-6 bg-gray-100 p-1 rounded-xl"
                variants={itemVariants}
              >
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-3 rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Mail size={18} className={loginMethod === 'email' ? 'text-purple-600' : 'text-gray-500'} />
                    <span className={`font-medium ${loginMethod === 'email' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Email
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-3 rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white shadow-md' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Phone size={18} className={loginMethod === 'phone' ? 'text-purple-600' : 'text-gray-500'} />
                    <span className={`font-medium ${loginMethod === 'phone' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Mobile OTP
                    </span>
                  </div>
                </button>
              </motion.div>

              {/* Demo Note for Mobile OTP */}
              {loginMethod === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm text-blue-800 text-center">
                    <strong>📱 Mobile OTP Login:</strong> Enter your registered phone number to receive OTP
                  </p>
                  <p className="text-xs text-blue-600 mt-1 text-center">
                    {process.env.NODE_ENV === 'development'
                      ? 'OTP will be shown on screen (Demo Mode)'
                      : 'OTP will be sent via SMS (Production Mode)'}
                  </p>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off">
                {/* Email/Mobile Field based on selection */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                  </label>
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginMethod === 'email' ? (
                        <Mail size={20} className={`transition-colors ${isFieldFocused === 'email' ? 'text-purple-600' : 'text-gray-400'}`} />
                      ) : (
                        <Phone size={20} className={`transition-colors ${isFieldFocused === 'phone' ? 'text-purple-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    {loginMethod === 'email' ? (
                      <motion.input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        onFocus={() => setIsFieldFocused('email')}
                        onBlur={() => setIsFieldFocused(null)}
                        required={loginMethod === 'email'}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 hover:bg-white text-sm md:text-base shadow-sm"
                        placeholder="you@example.com"
                        whileFocus={{
                          boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)"
                        }}
                      />
                    ) : (
                      <div className="flex">
                        <div className="flex items-center pl-3 pr-3 border-r border-gray-300 bg-gray-50 rounded-l-xl">
                          <Phone size={20} className={`transition-colors ${isFieldFocused === 'phone' ? 'text-purple-600' : 'text-gray-400'}`} />
                          <span className="text-gray-600 text-sm">+91</span>
                        </div>
                        <motion.input
                          type="tel"
                          name="phone"
                          value={loginData.phone}
                          onChange={handleChange}
                          onFocus={() => setIsFieldFocused('phone')}
                          onBlur={() => setIsFieldFocused(null)}
                          required={loginMethod === 'phone'}
                          className="w-full pl-4 pr-4 py-3.5 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 hover:bg-white text-sm md:text-base shadow-sm"
                          placeholder="9876543210"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          whileFocus={{
                            boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)"
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                  {loginMethod === 'phone' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Enter your registered 10-digit mobile number
                    </p>
                  )}
                </motion.div>

                {/* Password Field (only for email login) */}
                {loginMethod === 'email' && (
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Link
                          to="/forgot-password"
                          className="text-xs md:text-sm text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </motion.div>
                    </div>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={20} className={`transition-colors ${isFieldFocused === 'password' ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        onFocus={() => setIsFieldFocused('password')}
                        onBlur={() => setIsFieldFocused(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }
                        }}
                        required={loginMethod === 'email'}
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 hover:bg-white text-sm md:text-base shadow-sm"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        formNoValidate
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                )}

                {/* Remember Me (only for email login) */}
                {loginMethod === 'email' && (
                  <motion.div
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`relative w-6 h-6 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-300 hover:border-purple-400'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {rememberMe && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                    <label className="ml-3 text-sm text-gray-700 cursor-pointer select-none">
                      Remember me
                    </label>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-gray-900 to-purple-900 text-white font-semibold py-4 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-900 to-gray-900"
                      initial={false}
                      animate={{
                        x: isHovered ? '0%' : '-100%',
                      }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Button content */}
                    <div className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {loginMethod === 'email' ? 'Signing In...' : 'Sending OTP...'}
                        </>
                      ) : (
                        <>
                          {loginMethod === 'email' ? 'Sign In' : 'Send OTP'}
                          <motion.span
                            className="ml-2"
                            animate={{
                              x: [0, 5, 0],
                              opacity: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          >
                            →
                          </motion.span>
                        </>
                      )}
                    </div>

                    {/* Sparkle effect on hover */}
                    <AnimatePresence>
                      {isHovered && !isLoading && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              initial={{
                                x: Math.random() * 100 + '%',
                                y: '50%',
                                scale: 0,
                              }}
                              animate={{
                                x: Math.random() * 100 + '%',
                                y: ['50%', '0%', '100%', '50%'],
                                scale: [0, 1, 0],
                              }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </form>

              {/* Sign Up Link */}
              <motion.div
                className="mt-8 pt-6 border-t border-gray-100 text-center"
                variants={itemVariants}
              >
                <p className="text-sm md:text-base text-gray-600">
                  Don't have an account?{' '}
                  <motion.span whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/register"
                      className="font-semibold bg-gradient-to-r from-purple-600 to-gray-900 bg-clip-text text-transparent hover:from-purple-700 hover:to-black transition-all"
                    >
                      Sign up
                    </Link>
                  </motion.span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;