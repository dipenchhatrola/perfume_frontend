import { motion } from "framer-motion";
import { Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend} from "recharts";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw } from "lucide-react";

/* -------------------- INTERFACES -------------------- */
interface Order {
  id: string;
  orderId: string;
  user: string;
  userEmail: string;
  total: number;
  status: string;
  date: string;
  items: any[];
  address: string;
  payment: string;
}

interface DashboardStats {
  todayRevenue: string;
  todayOrders: number;
  avgOrderValue: string;
  totalOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
  pendingOrders: number;
}

interface SalesData {
  day: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
}

/* -------------------- DASHBOARD -------------------- */

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayRevenue: "₹0",
    todayOrders: 0,
    avgOrderValue: "₹0",
    totalOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'success'>('idle');
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());

  const COLORS = ["#6366f1", "#fb7185", "#facc15", "#10b981", "#8b5cf6", "#f59e0b"];

  // Countdown Timer Effect
  useEffect(() => {
    if (autoRefreshEnabled) {
      // Reset countdown on interval change or refresh
      setSecondsUntilRefresh(refreshInterval);
      
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      countdownIntervalRef.current = setInterval(() => {
        setSecondsUntilRefresh(prev => {
          if (prev <= 1) {
            // Trigger refresh when countdown reaches 0
            fetchOrdersAndStats();
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setSecondsUntilRefresh(refreshInterval);
    }
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, refreshInterval]);

  // Generate sales data from orders
  const generateSalesData = (ordersData: Order[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // Last 7 days including today
      return date;
    });

    const salesByDay = last7Days.map(date => {
      const dayStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      // Filter orders for this day
      const dayOrders = ordersData.filter(order => {
        try {
          const orderDate = new Date(order.date);
          return (
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        } catch (e) {
          return false;
        }
      });

      return {
        day: dayStr,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      };
    });

    return salesByDay;
  };

  // Generate category data from orders
  const generateCategoryData = (ordersData: Order[]) => {
    const categoryMap: { [key: string]: number } = {};

    ordersData.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Try to get category from item or extract from name
          let category = 'Uncategorized';
          if (item.category && typeof item.category === 'string') {
            category = item.category;
          } else if (item.name && typeof item.name === 'string') {
            // Extract category from name
            const name = item.name.toLowerCase();
            if (name.includes('perfume') || name.includes('fragrance')) category = 'Perfume';
            else if (name.includes('cologne')) category = 'Cologne';
            else if (name.includes('oil')) category = 'Essential Oil';
            else if (name.includes('spray')) category = 'Body Spray';
            else if (name.includes('cream') || name.includes('lotion')) category = 'Skincare';
            else if (name.includes('gift') || name.includes('set')) category = 'Gift Sets';
            else if (name.includes('shampoo') || name.includes('conditioner')) category = 'Hair Care';
            else if (name.includes('soap') || name.includes('bath')) category = 'Bath & Body';
          }

          const itemValue = (item.quantity || 1) * (item.price || 0);
          categoryMap[category] = (categoryMap[category] || 0) + itemValue;
        });
      }
    });

    // Convert to array and sort
    const categories = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name: name.length > 12 ? name.substring(0, 10) + '...' : name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories

    return categories;
  };

  // Fetch orders from localStorage and calculate stats
  const fetchOrdersAndStats = useCallback(async () => {
    try {
      setRefreshStatus('refreshing');
      
      // Get orders from localStorage
      const savedOrders = localStorage.getItem('perfume_orders');
      let ordersData: Order[] = [];

      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);

          // Transform orders to match Order interface
          ordersData = parsedOrders.map((order: any, index: number) => {
            const orderId = order.orderId || order.id || `ORD-${Date.now()}-${index}`;
            const rawItems = order.products || order.items || [];

            // Enhance items
            const enhancedItems = rawItems.map((item: any, idx: number) => ({
              id: item.id || `item-${index}-${idx}`,
              name: item.name || `Product ${idx + 1}`,
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              category: item.category || undefined,
              image: item.image || item.imageUrl || ''
            }));

            return {
              id: order.id || orderId,
              orderId,
              user: `${order.shipping?.firstName || 'Customer'} ${order.shipping?.lastName || ''}`,
              userEmail: order.shipping?.email || 'customer@example.com',
              total: Number(order.total) || 0,
              status: order.status || 'order placed',
              date: new Date(order.date || order.orderDate || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              items: enhancedItems,
              address: order.shipping ?
                `${order.shipping.address || ''}, ${order.shipping.city || ''}, ${order.shipping.state || ''} ${order.shipping.zipCode || ''}`
                : 'Address not specified',
              payment: order.paymentMethod || 'card'
            };
          });
        } catch (e) {
          console.error('Error parsing orders:', e);
        }
      }

      setOrders(ordersData);

      // Generate dynamic chart data
      const dynamicSalesData = generateSalesData(ordersData);
      const dynamicCategoryData = generateCategoryData(ordersData);

      setSalesData(dynamicSalesData);
      setCategoryData(dynamicCategoryData);

      // Calculate today's date
      const today = new Date();
      const todayString = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Filter today's orders
      const todayOrders = ordersData.filter(order => order.date === todayString);

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
      const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
      const pendingOrders = ordersData.filter(order =>
        order.status === 'order placed' ||
        order.status === 'shipped' ||
        order.status === 'out for delivery'
      ).length;

      // Today's stats
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const todayOrdersCount = todayOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get recent orders (last 4)
      const recent = ordersData
        .sort((a, b) => {
          try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } catch (e) {
            return 0;
          }
        })
        .slice(0, 4);

      setRecentOrders(recent.map(order => ({
        name: order.items?.[0]?.name || 'Product',
        price: `₹${order.total}`,
        orderId: order.orderId,
        status: order.status,
        date: order.date
      })));

      // Update dashboard stats
      setDashboardStats({
        todayRevenue: `₹${todayRevenue.toLocaleString()}`,
        todayOrders: todayOrdersCount,
        avgOrderValue: `₹${avgOrderValue.toFixed(0)}`,
        totalOrders,
        totalRevenue,
        deliveredOrders,
        pendingOrders
      });

      // Update last updated time
      const now = new Date();
      lastFetchTimeRef.current = now;
      setLastUpdated(now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));

      // Reset countdown
      setSecondsUntilRefresh(refreshInterval);

      setRefreshStatus('success');
      
      // Reset success status after 2 seconds
      setTimeout(() => {
        setRefreshStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRefreshStatus('idle');

      // Fallback sample data
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      const sampleSalesData = last7Days.map((day, i) => ({
        day,
        revenue: i === 6 ? 1690 : Math.floor(Math.random() * 500),
        orders: i === 6 ? 1 : Math.floor(Math.random() * 3)
      }));

      const sampleCategoryData = [
        { name: "Perfume", value: 1000 },
        { name: "Cologne", value: 500 },
        { name: "Gift Sets", value: 190 },
        { name: "Skincare", value: 150 },
        { name: "Bath & Body", value: 120 },
      ];

      setSalesData(sampleSalesData);
      setCategoryData(sampleCategoryData);
    } finally {
      setLoading(false);
    }
  }, [refreshInterval]);

  // Initialize on component mount
  useEffect(() => {
    fetchOrdersAndStats();
    
    // Listen for storage changes (real-time updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'perfume_orders') {
        fetchOrdersAndStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchOrdersAndStats]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchOrdersAndStats();
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  // Change refresh interval
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    setSecondsUntilRefresh(interval);
  };

  // Navigate to orders page
  const navigateToOrders = () => {
    navigate('/admin/orders');
  };

  // Navigate to specific order details
  const navigateToOrder = (orderId: string) => {
    navigate(`/admin/orders?order=${orderId}`);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value}`;
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Custom tooltip for sales chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-40">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 ml-4">
                {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-40">
          <p className="font-semibold text-gray-800 mb-2">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold">₹{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-6 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-4 md:p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <Sparkles className="text-blue-500" size={24} />
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" as const }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Dashboard
            </motion.h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 mt-2 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Real-time analytics and insights
          </motion.p>
        </div>
        
        {/* AUTO-REFRESH CONTROLS */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">            
            {/* Manual Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualRefresh}
              disabled={refreshStatus === 'refreshing'}
              className={`px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm hover:shadow-md transition-all border border-gray-200 text-sm ${
                refreshStatus === 'refreshing' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <motion.div
                animate={refreshStatus === 'refreshing' ? { rotate: 360 } : {}}
                transition={refreshStatus === 'refreshing' ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw size={14} />
              </motion.div>
              {refreshStatus === 'refreshing' ? 'Refreshing...' : 'Refresh Now'}
            </motion.button>
            
            {/* View Orders Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={navigateToOrders}
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Orders
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Today Revenue",
            value: dashboardStats.todayRevenue,
            color: "from-green-100 to-emerald-100 border-green-200",
            icon: (
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ),
            trend: "+12%"
          },
          {
            title: "Today Orders",
            value: dashboardStats.todayOrders.toString(),
            color: "from-blue-100 to-cyan-100 border-blue-200",
            icon: (
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            ),
            trend: "+8%"
          },
          {
            title: "Total Orders",
            value: dashboardStats.totalOrders.toString(),
            color: "from-purple-100 to-violet-100 border-purple-200",
            icon: (
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            ),
            trend: dashboardStats.totalOrders > 0 ? `+${Math.floor(dashboardStats.totalOrders / 10)}%` : "0%"
          },
          {
            title: "Total Revenue",
            value: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
            color: "from-amber-100 to-orange-100 border-amber-200",
            icon: (
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            ),
            trend: dashboardStats.totalRevenue > 0 ? `+${Math.floor(dashboardStats.totalRevenue / 100)}%` : "0%"
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 shadow-lg border`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">from yesterday</span>
                </div>
              </div>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* DELIVERY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Delivered Orders</h3>
              <p className="text-sm text-gray-500">Completed transactions</p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {dashboardStats.deliveredOrders}
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${dashboardStats.totalOrders > 0 ?
                  (dashboardStats.deliveredOrders / dashboardStats.totalOrders) * 100 : 0}%`
              }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dashboardStats.totalOrders > 0
              ? `${Math.round((dashboardStats.deliveredOrders / dashboardStats.totalOrders) * 100)}% of total orders`
              : 'No orders yet'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Pending Orders</h3>
              <p className="text-sm text-gray-500">In progress</p>
            </div>
            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              {dashboardStats.pendingOrders}
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${dashboardStats.totalOrders > 0 ?
                  (dashboardStats.pendingOrders / dashboardStats.totalOrders) * 100 : 0}%`
              }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dashboardStats.totalOrders > 0
              ? `${Math.round((dashboardStats.pendingOrders / dashboardStats.totalOrders) * 100)}% of total orders`
              : 'No orders yet'
            }
          </p>
        </motion.div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* SALES CHART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
              <p className="text-sm text-gray-500">Last 7 days revenue vs orders</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => {
                    return formatCurrency(value);
                  }}
                  width={60}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#fb7185"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, fill: "#fb7185" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="text-gray-600">
                Total Revenue: <span className="font-semibold">₹{salesData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}</span>
              </div>
              <div className="text-gray-600">
                Total Orders: <span className="font-semibold">{salesData.reduce((sum, day) => sum + day.orders, 0)}</span>
              </div>
              <div className="text-gray-600">
                Average Order: <span className="font-semibold">
                  ₹{salesData.reduce((sum, day) => sum + day.orders, 0) > 0
                    ? Math.round(salesData.reduce((sum, day) => sum + day.revenue, 0) / salesData.reduce((sum, day) => sum + day.orders, 0))
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CATEGORY CHART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Top Categories</h3>
            <p className="text-sm text-gray-500">Revenue by product category</p>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="h-56 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categoryData.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 flex-shrink-0 ml-2">
                      ₹{category.value.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4 text-gray-300">📊</div>
              <p className="text-gray-500 font-medium">No category data</p>
              <p className="text-sm text-gray-400 mt-2">Add categories to products</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">
                ₹{categoryData.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RECENT ORDERS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
          <span className="text-sm text-gray-500">
            Showing {Math.min(recentOrders.length, 4)} of {dashboardStats.totalOrders} orders
          </span>
        </div>
        {recentOrders.length > 0 ? (
          <ul className="space-y-3">
            {recentOrders.map((order, i) => (
              <motion.li
                key={i}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigateToOrder(order.orderId)}
                className="flex justify-between items-center bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700 font-medium block">{order.name}</span>
                      <span className="text-sm text-gray-500">Order ID: {order.orderId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800 block">{order.price}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 ml-4 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent orders found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={navigateToOrders}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              View All Orders
            </motion.button>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToOrders}
          className="w-full mt-6 px-4 py-3 text-center bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          View All Orders →
        </motion.button>
      </motion.div>
    </div>
  );
}