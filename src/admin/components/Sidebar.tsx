import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Settings, Bell, HelpCircle, TrendingUp, 
  ChevronRight, LogOut, Currency, Calendar, Clock,
  Menu, X, ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [stats, setStats] = useState({ todayOrders: 0, revenue: 0 });
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch stats logic
  useEffect(() => {
    const getRealtimeStats = () => {
      const savedOrders = localStorage.getItem('perfume_orders');
      if (savedOrders) {
        const ordersData = JSON.parse(savedOrders);
        const todayString = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        const todayOrders = ordersData.filter((order: any) => {
          const orderDate = new Date(order.date || order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          return orderDate === todayString;
        });

        // Calculate total revenue for today
        const todayRevenue = todayOrders.reduce((sum: number, order: any) => 
          sum + (order.total || order.amount || 0), 0);

        setStats({
          todayOrders: todayOrders.length,
          revenue: todayRevenue
        });
      }
    };

    getRealtimeStats();
    window.addEventListener('storage', getRealtimeStats);
    return () => window.removeEventListener('storage', getRealtimeStats);
  }, []);

  const mainMenuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Users", path: "/admin/users", icon: Users },
  ];

  const secondaryMenuItems = [
    { name: "Settings", path: "/admin/settings", icon: Settings },
    { name: "Help Center", path: "/admin/help", icon: HelpCircle },
  ];

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.1)" }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-gray-900 to-[#0f172a] text-white rounded-xl shadow-lg border border-gray-800 md:hidden ${isSidebarOpen ? 'hidden' : ''}`}
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={{ x: isMobile ? -320 : 0 }}
        animate={{ x: isSidebarOpen ? 0 : (isMobile ? -320 : 0) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-screen w-64 md:w-72 lg:w-80 bg-gradient-to-b from-gray-900 to-[#0f172a] border-r border-gray-800/50 flex flex-col z-40 font-sans shadow-2xl ${!isSidebarOpen && isMobile ? 'hidden' : ''}`}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        )}

        {/* Logo & Header */}
        <motion.div 
          className="px-4 md:px-6 py-6 md:py-8 border-b border-gray-800/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div 
              className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl"
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: "spring" }}
            >
              <p className="text-lg md:text-xl lg:text-2xl font-bold w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-white text-purple-600 rounded-full">A</p>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admin
              </h2>
              <div className="flex items-center gap-1 md:gap-2 mt-1">
                <Clock size={10} className="text-blue-400 md:h-3 md:w-3" />
                <p className="text-xs text-gray-400 font-medium">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Navigation</p>
              <Calendar size={12} className="text-gray-500 md:h-3 md:w-3" />
            </div>
            
            <ul className="space-y-1 md:space-y-2">
              <AnimatePresence>
                {mainMenuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={menuItemVariants}
                    transition={{ delay: index * 0.05 }}
                    whileHover="hover"
                    onHoverStart={() => setActiveHover(item.path)}
                    onHoverEnd={() => setActiveHover(null)}
                  >
                    <Link to={item.path} onClick={handleLinkClick}>
                      <motion.div 
                        className={`flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl transition-all relative overflow-hidden ${
                          location.pathname === item.path 
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {/* Animated background on hover */}
                        {activeHover === item.path && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                        
                        <div className="flex items-center gap-3 md:gap-4 z-10">
                          <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${
                            location.pathname === item.path 
                              ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                              : "bg-gray-800"
                          }`}>
                            <item.icon size={18} className="md:h-5 md:w-5" />
                          </div>
                          <span className="text-sm font-semibold">{item.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 z-10">
                          {location.pathname === item.path && (
                            <motion.div
                              initial={{ rotate: -90 }}
                              animate={{ rotate: 0 }}
                            >
                              <ChevronRight size={14} className="text-blue-400 md:h-4 md:w-4" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="mt-6 md:mt-8"
            initial="hidden"
            animate="visible"
            variants={statsVariants}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-[#1e293b]/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <TrendingUp size={16} className="text-blue-400 md:h-4 md:w-4" />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-white">Today's Overview</h3>
                </div>
                <div className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
                  <span className="text-xs font-bold text-blue-300">Live</span>
                </div>
              </div>

              <div className="grid gap-3 md:gap-4">
                {/* Orders Card */}
                <motion.div
                  className="bg-gradient-to-br from-gray-900 to-[#0f172a] p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-800"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-400">Today's Orders</p>
                      <p className="text-lg md:text-2xl font-black text-white mt-1 md:mt-2">{stats.todayOrders}</p>
                    </div>
                    <motion.div 
                      className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                    >
                      <ShoppingCart size={16} className="text-white md:h-5 md:w-5" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Revenue Card */}
                <motion.div
                  className="bg-gradient-to-br from-gray-900 to-[#0f172a] p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-800"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-400">Today's Revenue</p>
                      <p className="text-lg md:text-2xl font-black text-white mt-1 md:mt-2">
                        ₹{stats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <motion.div 
                      className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <span className="text-white text-sm md:text-base" style={{ fontSize: '16px' }}>₹</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </nav>
      </motion.aside>
    </>
  );
}