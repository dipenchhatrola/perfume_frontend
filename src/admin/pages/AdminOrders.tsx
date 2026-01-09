// AdminOrders.tsx - Redesigned Admin Panel with Enhanced Animations
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Eye, Sparkles } from 'lucide-react';

// Define TypeScript interfaces
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface LocalStorageOrder {
  id: string;
  orderId?: string;
  date: string;
  orderDate?: string;
  items?: any[];
  products?: any[];
  total: number;
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  status?: string;
}

interface TransformedOrder {
  id: string;
  orderId: string;
  user: string;
  userEmail: string;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
  address: string;
  payment: string;
  cancelledBy?: 'user' | 'admin';
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  delivered: number;
  placed: number;
  [key: string]: any;
}

export default function Orders() {
  // State with proper types
  const [orders, setOrders] = useState<TransformedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    delivered: 0,
    placed: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<TransformedOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation variants with proper TypeScript types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: { scale: 0.98 }
  };

  const staggerItem: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const tableRowVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }),
    hover: {
      backgroundColor: "rgba(249, 250, 251, 1)",
      scale: 1.005,
      transition: { duration: 0.2 }
    }
  };

  // Calculate stats from orders
  const calculateStats = (ordersData: TransformedOrder[]) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
    const delivered = ordersData.filter(order => order.status === 'delivered').length;
    const placed = ordersData.filter(order => order.status === 'order placed').length;

    return {
      totalOrders,
      totalRevenue,
      delivered,
      placed
    };
  };

  // Fetch all orders for admin
  const fetchAdminOrders = async () => {
    setIsRefreshing(true);
    try {
      // Try to fetch from localStorage first
      const savedOrders = localStorage.getItem('perfume_orders');
      let parsedOrders: LocalStorageOrder[] = [];

      if (savedOrders) {
        try {
          parsedOrders = JSON.parse(savedOrders);
          console.log('Loaded orders from localStorage:', parsedOrders.length);
        } catch (e) {
          console.error('Error parsing localStorage orders:', e);
        }
      }

      // Also try to fetch from API if available
      try {
        const apiResponse = await fetch('https://perfume-signaturefragrance-backend.vercel.app/api/orders/admin');
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.success && apiData.orders) {
            console.log('API orders loaded:', apiData.orders.length);
            // Merge with localStorage orders or use API orders
            if (apiData.orders.length > 0) {
              parsedOrders = [...parsedOrders, ...apiData.orders];
            }
          }
        }
      } catch (apiError) {
        console.log('API not available, using localStorage orders only');
      }

      // Transform orders for UI
      const transformedOrders: TransformedOrder[] = parsedOrders.map((order, index) => {
        const orderId = order.orderId || order.id || `ORD-${Date.now()}-${index}`;

        // Handle items/products data
        const rawItems = order.products || order.items || [];
        const enhancedItems = rawItems.map((item: any) => ({
          productId: item.productId || item.id || item._id || `prod-${index}`,
          name: item.name || item.productName || 'Product Name',
          price: item.price || item.productPrice || 0,
          quantity: item.quantity || 1,
          image: item.image || item.imageUrl || item.productImage || 'https://via.placeholder.com/100'
        }));

        // Handle shipping data
        const shipping = order.shipping || {
          firstName: 'Customer',
          lastName: '',
          email: 'customer@example.com',
          phone: '',
          address: 'Not specified',
          city: '',
          state: '',
          zipCode: ''
        };

        // Handle date
        const orderDate = order.date || order.orderDate || new Date().toISOString();
        const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return {
          id: order.id || orderId,
          orderId,
          user: `${shipping.firstName} ${shipping.lastName}`.trim() || 'Customer',
          userEmail: shipping.email || 'customer@example.com',
          total: order.total || 0,
          status: order.status || 'order placed',
          date: formattedDate,
          items: enhancedItems,
          address: shipping.address ?
            `${shipping.address}, ${shipping.city || ''}, ${shipping.state || ''} ${shipping.zipCode || ''}`.trim()
            : 'Address not specified',
          payment: order.paymentMethod || 'card'
        };
      });

      // Remove duplicates based on orderId
      const uniqueOrders = Array.from(
        new Map(transformedOrders.map(order => [order.orderId, order])).values()
      );

      setOrders(uniqueOrders);
      setStats(calculateStats(uniqueOrders));

    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Update localStorage
      const savedOrders = localStorage.getItem('perfume_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const updatedOrders = orders.map((order: any) =>
          order.id === orderId || order.orderId === orderId ? { ...order, status: newStatus } : order
        );
        localStorage.setItem('perfume_orders', JSON.stringify(updatedOrders));
      }

      // Try to update via API
      try {
        await fetch(`https://perfume-signaturefragrance-backend.vercel.app/api/orders/admin/order/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (apiError) {
        console.log('API update failed, using localStorage only');
      }

      // Update UI state
      setOrders(prev => prev.map(order =>
        order.id === orderId || order.orderId === orderId ? { ...order, status: newStatus } : order
      ));

      setStats(calculateStats(orders));

      // Show success message
      //alert(`Order ${orderId} status updated to: ${newStatus}`);

    } catch (error) {
      console.error('Error updating status:', error);
      //alert('Failed to update status');
    }
  };

  const [tempStatus, setTempStatus] = useState<string>('');

  // View order details
  const handleViewDetails = (order: TransformedOrder) => {
    setSelectedOrder(order);
    setTempStatus(order.status);
    setIsModalOpen(true);
  };

  // Initialize on component mount
  useEffect(() => {
    fetchAdminOrders();

    // Optional: Set up an interval to refresh orders every 30 seconds
    const intervalId = setInterval(() => {
      fetchAdminOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Helper for status styling
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100";
      case "out for delivery":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 shadow-green-100";
      case "order placed":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 shadow-amber-100";
      case "shipped":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-blue-100";
      case "cancelled":
        return "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 border-rose-200 shadow-rose-100";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-gray-100";
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-lg font-semibold text-gray-700"
          >
            Loading your orders...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
    >
      {/* Header */}
      <motion.header
        variants={staggerItem}
        className="bg-gradient-to-r from-white to-blue-50 border-b border-gray-200/60 px-6 py-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto">
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
                transition={{ delay: 0.2, type: "spring" }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Order Dashboard
              </motion.h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-600 mt-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Manage customer orders and transactions in real-time
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAdminOrders}
            disabled={isRefreshing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isRefreshing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span className="font-medium">Refreshing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Refresh Orders</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Total Orders",
              value: stats.totalOrders,
              color: "blue",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              label: "Total Revenue",
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              color: "emerald",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              gradient: "from-emerald-500 to-green-500"
            },
            {
              label: "Orders Placed",
              value: stats.placed,
              color: "amber",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              gradient: "from-amber-500 to-orange-500"
            },
            {
              label: "Delivered Orders",
              value: stats.delivered,
              color: "green",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              gradient: "from-green-500 to-teal-500"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              custom={index}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </motion.div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                className="mt-4 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          variants={staggerItem}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 mb-8 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative flex-1 max-w-lg"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders, customers, or IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </motion.div>

              <div className="flex flex-wrap gap-3">
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="order placed">Order Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out for delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </motion.select>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600"
            >
              Showing <span className="font-bold text-blue-600">{filteredOrders.length}</span> of{' '}
              <span className="font-bold text-gray-900">{orders.length}</span> orders
            </motion.div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          variants={staggerItem}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg"
        >
          <div className="w-full">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Payment', 'Actions'].map((header, idx) => (
                    <th key={header} className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {header}
                      </motion.div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      variants={tableRowVariants}
                      className="hover:bg-gray-50/80 transition-colors duration-200"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                          {order.orderId}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{order.user}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{order.date}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                        >
                          ₹{order.total.toLocaleString()}
                        </motion.div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusStyles(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </motion.span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${order.payment === 'card' ? 'bg-blue-500' :
                            order.payment === 'paypal' ? 'bg-blue-400' :
                              'bg-green-500'
                            }`} />
                          <span className="text-sm font-medium text-gray-700 capitalize">{order.payment}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewDetails(order)}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Eye size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-gray-400 text-6xl mb-6"
                      >
                        📦
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search or filter criteria'
                          : 'Start by adding some orders to see them here.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 100
                }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg"
                    >
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.orderId}</h2>
                      <p className="text-sm text-gray-500 mt-1">Placed on {selectedOrder.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsModalOpen(false)}
                      className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Customer & Shipping */}
                      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              Customer Information
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Customer Name</p>
                                <p className="text-base font-medium text-gray-900 mt-1">{selectedOrder.user}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-base font-medium text-gray-900 mt-1">{selectedOrder.userEmail}</p>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              Shipping Information
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Shipping Address</p>
                                <p className="text-base font-medium text-gray-900 mt-1">{selectedOrder.address}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                                <motion.select
                                  whileHover={{ scale: 1.05 }}
                                  whileFocus={{ scale: 1.05 }}
                                  value={tempStatus}
                                  onChange={(e) => setTempStatus(e.target.value)}
                                  className={`text-sm border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${getStatusStyles(selectedOrder.status)}`}
                                  style={{ minWidth: '140px' }}
                                >
                                  <option value="order placed">Order Placed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="out for delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </motion.select>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                          <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="px-8 py-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors duration-200"
                            >
                              <div className="flex items-center gap-6">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                                    }}
                                  />
                                </motion.div>
                                <div>
                                  <p className="text-base font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-500 mt-1">Product ID: {item.productId}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-8">
                                <div className="text-right">
                                  <p className="text-base font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="space-y-8">
                      {/* Order Summary */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-8 shadow-lg"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
                        <div className="space-y-4">
                          {[
                            { label: "Subtotal", value: selectedOrder.total },
                            { label: "Shipping", value: 0 },
                            { label: "Tax (18%)", value: selectedOrder.total * 0.18 }
                          ].map((item, idx) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm text-gray-600">{item.label}</span>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </motion.div>
                          ))}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="pt-4 border-t border-gray-300 mt-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-gray-900">Total</span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                ₹{(selectedOrder.total * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="mt-8 pt-8 border-t border-gray-300"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment Method</span>
                            <span className="text-sm font-semibold text-gray-900 capitalize">{selectedOrder.payment}</span>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Quick Actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (selectedOrder && tempStatus !== selectedOrder.status) {
                                handleUpdateStatus(selectedOrder.id, tempStatus);
                                setIsModalOpen(false);
                              }
                            }}
                            disabled={!selectedOrder || tempStatus === selectedOrder?.status}
                            className={`w-full px-4 py-3 text-sm font-medium text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${!selectedOrder || tempStatus === selectedOrder?.status
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                              }`}
                          >
                            {tempStatus === selectedOrder?.status ? 'No Changes' : 'Update Status'}
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}