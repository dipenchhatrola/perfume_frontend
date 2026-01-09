import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail, Phone, Calendar, Search, Edit, Trash2,
  UserPlus, ChevronLeft, ChevronRight, Shield,
  MoreVertical, Eye, X, AlertCircle,
  TrendingUp, Users as UsersIcon, UserCheck, Clock, Sparkles,
  ArrowRight, Loader, Check, 
  Key, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import toast from 'react-hot-toast';

//const API_BASE_URL = 'https://perfume-signaturefragrance-backend.vercel.app/api';
const API_BASE_URL = 'http://localhost:5000/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: string;
  lastLogin: string;
  avatarColor: string;
  username?: string;
  password?: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);

      // Get token from localStorage
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401) {
          setApiError('Authentication failed. Please login again.');
          toast.error('Session expired. Please login again.');
        } else if (response.status === 403) {
          setApiError('You do not have permission to access users.');
          toast.error('Permission denied.');
        } else {
          setApiError(`Failed to fetch users: ${response.status} ${response.statusText}`);
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        // Load from localStorage as fallback
        const storedUsers = localStorage.getItem('perfume_users');
        if (storedUsers) {
          try {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUsers(parsed);
              toast('Using cached data');
              return;
            }
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        }
        return;
      }

      const result = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        // Convert API response to UserData format
        const formattedUsers: UserData[] = result.data.map((user: any, index: number) => {
          // Avatar colors array
          const colors = [
            'bg-gradient-to-r from-blue-500 to-cyan-400',
            'bg-gradient-to-r from-purple-500 to-pink-400',
            'bg-gradient-to-r from-green-500 to-emerald-400',
            'bg-gradient-to-r from-orange-500 to-amber-400',
            'bg-gradient-to-r from-red-500 to-rose-400',
            'bg-gradient-to-r from-indigo-500 to-blue-400',
            'bg-gradient-to-r from-teal-500 to-cyan-400',
            'bg-gradient-to-r from-pink-500 to-rose-400',
          ];

          // Format name - Check all possible fields
          let displayName = 'Unknown User';

          if (user.username) {
            displayName = user.username;
          }

          if (user.firstName || user.lastName) {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            if (fullName) displayName = fullName;
          }

          if (user.name) {
            displayName = user.name;
          }

          if (user.email && displayName === 'Unknown User') {
            displayName = user.email.split('@')[0];
          }

          // Format dates
          const formatDate = (dateString: string | Date) => {
            if (!dateString) return new Date().toISOString().split('T')[0];
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0]; // YYYY-MM-DD format
            } catch (e) {
              console.error('Date formatting error:', e);
              return new Date().toISOString().split('T')[0];
            }
          };

          // Determine status based on user data
          let userStatus: 'active' | 'inactive' | 'suspended' = 'active';
          if (user.status) {
            userStatus = user.status;
          } else if (user.isActive === false) {
            userStatus = 'inactive';
          } else if (user.isBanned || user.isSuspended) {
            userStatus = 'suspended';
          }

          const formattedUser = {
            id: user._id || user.id || `user-${index + 1}`,
            name: displayName,
            email: user.email || 'no-email@example.com',
            phone: user.phone || '+1 000 000 0000',
            role: (user.role || 'user') as 'admin' | 'user' | 'moderator',
            status: userStatus,
            registrationDate: formatDate(user.createdAt || user.joinDate || user.registrationDate),
            lastLogin: formatDate(user.lastLogin || user.lastActive),
            avatarColor: colors[index % colors.length],
            username: user.username,
            password: user.password || undefined,
          };

          return formattedUser;
        });

        setUsers(formattedUsers);

        // Also save to localStorage for offline viewing
        localStorage.setItem('perfume_users', JSON.stringify(formattedUsers));

        toast.success(`Loaded ${formattedUsers.length} users successfully!`);
      } else {
        setApiError('Invalid response format from server');
        toast.error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setApiError(error.message || 'Failed to load users');
      toast.error('Failed to load users. Check console for details.');

      // Fallback to localStorage if API fails
      try {
        const storedUsers = localStorage.getItem('perfume_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
            toast('Using cached data');
          }
        } else {
          setUsers([]);
        }
      } catch (storageError) {
        console.error('Error loading from localStorage:', storageError);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUsers();
    }
  }, [fetchUsers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'user' | 'moderator',
    password: '',
  });
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Password display component
  const PasswordDisplay = ({ password }: { password?: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!password) return <span className="text-gray-400">No password</span>;

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono">
          {isVisible ? password : '••••••••'}
        </span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(password);
            showNotificationMessage('Password copied to clipboard!');
          }}
          className="text-xs text-green-500 hover:text-green-700"
          title="Copy password"
        >
          Copy
        </button>
      </div>
    );
  };

  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
      // If already in MM/DD/YYYY format
      if (dateString.includes('/')) {
        return dateString;
      }

      // Parse date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  }, []);

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Safe string capitalizer
  const capitalizeString = (str: string): string => {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Add user via API
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          password: newUser.password || 'defaultPassword123',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add user');
      }

      if (result.success) {
        // Refresh users list
        fetchUsers();
        setNewUser({ name: '', email: '', phone: '', role: 'user', password: '' });
        setShowAddModal(false);
        toast.success('User added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    }
  };

  // Edit user via API
  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          status: selectedUser.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user');
      }

      if (result.success) {
        // Refresh users list
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        toast.success('User updated successfully!');
      }
    } catch (error: any) {
      console.error('Error editing user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  // Delete user via API
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setIsDeleting(id);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete user');
      }

      if (result.success) {
        // Remove from local state
        setUsers(users.filter(user => user.id !== id));
        toast.success('User deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      if (result.success) {
        // Update local state
        setUsers(users.map(user =>
          user.id === id ? { ...user, status: newStatus } : user
        ));
        toast.success(`User status updated to ${newStatus}`);
      }
    } catch (error: any) {
      console.error('Error changing status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'inactive': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'suspended': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'moderator': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'user': return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    todayLogins: users.filter(u => {
      const today = new Date().toISOString().split('T')[0];
      return u.lastLogin === today;
    }).length,
    growth: '+12% this month',
  };

  // Get user initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
  };

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Skeleton Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8"
    >
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-3 backdrop-blur-sm">
              <Check className="animate-pulse" size={20} />
              <span className="font-medium">{notificationMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <Sparkles className="text-blue-600" size={28} />
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" as const }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent"
                >
                  User Management
                </motion.h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-600 mt-1 text-sm md:text-base"
              >
                Manage all registered users and permissions
              </motion.p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 text-sm font-medium">
                  <UsersIcon size={16} />
                  <span>{users.length} total users</span>
                </div>
                {apiError && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                    <AlertCircle size={16} />
                    <span>Using cached data</span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchUsers}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all hover:shadow-md hover:shadow-slate-200/50 group"
                title="Refresh users"
              >
                <RefreshCw size={20} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-medium text-slate-700">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-all group relative overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <UserPlus size={20} className="relative z-10" />
                <span className="relative z-10 font-semibold">Add User</span>
                <ArrowRight className="relative z-10 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={16} />
              </motion.button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          >
            {[
              {
                label: 'Total Users',
                value: stats.total,
                icon: UsersIcon,
                color: 'from-blue-500 to-cyan-500',
                trend: stats.growth,
                trendIcon: TrendingUp,
                bgColor: 'bg-blue-50'
              },
              {
                label: 'Active Users',
                value: stats.active,
                icon: UserCheck,
                color: 'from-emerald-500 to-green-500',
                bgColor: 'bg-emerald-50'
              },
              {
                label: 'Administrators',
                value: stats.admins,
                icon: Shield,
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50'
              },
              {
                label: "Today's Logins",
                value: stats.todayLogins,
                icon: Clock,
                color: 'from-amber-500 to-orange-500',
                bgColor: 'bg-amber-50'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                className={`${stat.bgColor} rounded-2xl p-6 border border-slate-200/50 hover:border-slate-300/50 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-slate-600 mb-2 font-medium">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        className="text-3xl font-bold text-slate-900"
                      >
                        {stat.value}
                      </motion.p>
                      {stat.trend && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="text-sm text-emerald-600 font-medium flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg"
                        >
                          <stat.trendIcon size={14} />
                          {stat.trend}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg transition-all`}
                  >
                    <stat.icon className="text-white" size={24} />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                  className="h-0.5 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent mt-6"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 mb-8 shadow-sm border border-slate-200/50 shadow-slate-100/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm hover:shadow"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Filters and Controls */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: AlertCircle,
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ['All Status', 'Active', 'Inactive', 'Suspended'],
                  values: ['all', 'active', 'inactive', 'suspended']
                }
              ].map((filter, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <filter.icon size={18} className="text-slate-500" />
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer font-medium text-sm"
                  >
                    {filter.options.map((option, i) => (
                      <option key={option} value={filter.values[i]}>{option}</option>
                    ))}
                  </select>
                </motion.div>
              ))}

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl"
              >
                <span className="text-slate-500 text-sm font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer font-medium text-sm"
                >
                  <option value="name">Name A-Z</option>
                  <option value="date">Newest First</option>
                  <option value="status">Status</option>
                </select>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-xl"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-sm scale-110' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  <div className="grid grid-cols-2 gap-1 w-5 h-5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-slate-400'}`}
                      />
                    ))}
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm scale-110' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  <div className="flex flex-col gap-1 w-5 h-5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full ${viewMode === 'list' ? 'bg-blue-600' : 'bg-slate-400'}`}
                      />
                    ))}
                  </div>
                </motion.button>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-medium text-sm border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          </div>

          {/* Filter Summary */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Showing {sortedUsers.length} of {users.length} users</span>
            </div>

            {(searchTerm || selectedStatus !== 'all') && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">Active filters:</span>
                {searchTerm && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100"
                  >
                    <Search size={12} />
                    "{searchTerm}"
                  </motion.span>
                )}
                {selectedStatus !== 'all' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100"
                  >
                    <AlertCircle size={12} />
                    {selectedStatus}
                  </motion.span>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Users List/Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            {viewMode === 'list' ? (
              /* List View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden backdrop-blur-sm"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200/60">
                    <thead className="bg-slate-50/80">
                      <tr>
                        {['User', 'Contact', 'Password', 'Status', 'Registration', 'Actions'].map((header, index) => (
                          <motion.th
                            key={header}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                          >
                            {header}
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/40">
                      <AnimatePresence>
                        {currentUsers.length > 0 ? (
                          currentUsers.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{
                                backgroundColor: 'rgba(241, 245, 249, 0.3)',
                                transition: { duration: 0.2 }
                              }}
                              className="group hover:bg-slate-50/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-md ${user.avatarColor}`}
                                  >
                                    {getInitials(user.name)}
                                  </motion.div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono">ID: {user.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="text-slate-700">{user.email}</span>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Phone size={14} className="text-slate-400" />
                                    <span className="text-slate-500 font-medium">{user.phone}</span>
                                  </motion.div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <PasswordDisplay password={user.password} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(user.status)}`}
                                  >
                                    {capitalizeString(user.status)}
                                  </motion.span>
                                  <select
                                    value={user.status}
                                    onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                                    className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white hover:bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                  </select>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-900 font-medium">
                                  <Calendar size={12} className="inline mr-1 text-slate-400" />
                                  {formatDate(user.registrationDate)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  <Calendar size={12} className="inline mr-1 text-slate-400" />
                                  Last: {formatDate(user.lastLogin)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#dbeafe' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowEditModal(true);
                                    }}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit user"
                                  >
                                    <Edit size={18} />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isDeleting === user.id}
                                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete user"
                                  >
                                    {isDeleting === user.id ? (
                                      <Loader className="animate-spin" size={18} />
                                    ) : (
                                      <Trash2 size={18} />
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <MoreVertical size={18} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <motion.div
                                animate={{
                                  rotate: [0, 360],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{
                                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                  scale: { duration: 1, repeat: Infinity }
                                }}
                                className="text-slate-300 mb-4"
                              >
                                <Search size={56} className="mx-auto" />
                              </motion.div>
                              <p className="text-slate-600 font-medium text-lg mb-2">No users found</p>
                              <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                              <button
                                onClick={resetFilters}
                                className="mt-4 px-5 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-medium transition-colors"
                              >
                                Reset all filters
                              </button>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              /* Grid View */
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      variants={cardVariants}
                      whileHover={{
                        y: -8,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-xl transition-all backdrop-blur-sm hover:border-slate-300/50"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${user.avatarColor}`}
                          >
                            {getInitials(user.name)}
                          </motion.div>
                          <div>
                            <h3 className="font-bold text-slate-900">{user.name}</h3>
                            <p className="text-sm text-slate-500 font-mono">ID: {user.id}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ rotate: 90 }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                          <MoreVertical size={20} />
                        </motion.button>
                      </div>

                      <div className="space-y-4 mb-6">
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-3 text-sm p-3 bg-slate-50/50 rounded-lg"
                        >
                          <Mail size={16} className="text-slate-400" />
                          <span className="text-slate-700 truncate">{user.email}</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-3 text-sm p-3 bg-slate-50/50 rounded-lg"
                        >
                          <Phone size={16} className="text-slate-400" />
                          <span className="text-slate-700">{user.phone}</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-3 text-sm p-3 bg-slate-50/50 rounded-lg"
                        >
                          <Key size={16} className="text-slate-400" />
                          <span className="font-mono text-slate-700">
                            {user.password ? '••••••••' : 'No password'}
                          </span>
                          {user.password && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.password || '');
                                showNotificationMessage('Password copied to clipboard!');
                              }}
                              className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium"
                              title="Copy password"
                            >
                              Copy
                            </button>
                          )}
                        </motion.div>
                      </div>

                      <div className="text-xs text-slate-500 mb-6 space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="font-medium">Registered</span>
                          <span className="font-medium text-slate-700">
                            <Calendar size={12} className="inline mr-1" />
                            {formatDate(user.registrationDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="font-medium">Last Login</span>
                          <span className="font-medium text-slate-700">
                            <Calendar size={12} className="inline mr-1" />
                            {formatDate(user.lastLogin)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: '#dbeafe' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="flex-1 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                          className="flex-1 py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isDeleting === user.id ? (
                            <Loader className="animate-spin mx-auto" size={18} />
                          ) : (
                            'Delete'
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                          <Eye size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="col-span-full bg-white rounded-2xl p-16 text-center border border-slate-200/50"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                      className="text-slate-300 mb-6"
                    >
                      <Search size={72} className="mx-auto" />
                    </motion.div>
                    <p className="text-slate-600 text-xl font-medium mb-3">No users found</p>
                    <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-medium transition-colors border border-blue-200 hover:border-blue-300"
                    >
                      Reset all filters
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200/50"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-700">
                Showing <span className="font-semibold text-slate-900">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(indexOfLastUser, sortedUsers.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{sortedUsers.length}</span> users
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:shadow-sm"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </motion.button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                      : 'border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700'
                      }`}
                  >
                    {page}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:shadow-sm"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-slate-900"
                  >
                    Add New User
                  </motion.h2>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: newUser.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, name: e.target.value }), type: 'text', placeholder: 'Enter full name' },
                    { label: 'Email Address', value: newUser.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value }), type: 'email', placeholder: 'Enter email address' },
                    { label: 'Phone Number', value: newUser.phone, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, phone: e.target.value }), type: 'tel', placeholder: 'Enter phone number' },
                    { label: 'Password', value: newUser.password, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, password: e.target.value }), type: 'password', placeholder: 'Enter password' },
                  ].map((field, index) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        placeholder={field.placeholder}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddUser}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl transition-all"
                  >
                    Add User
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-slate-900"
                  >
                    Edit User
                  </motion.h2>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: selectedUser.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSelectedUser({ ...selectedUser, name: e.target.value }), type: 'text' },
                    { label: 'Email Address', value: selectedUser.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSelectedUser({ ...selectedUser, email: e.target.value }), type: 'email' },
                  ].map((field, index) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password (Read-only)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedUser.password || 'No password set'}
                        readOnly
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      {selectedUser.password && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.password || '');
                            showNotificationMessage('Password copied to clipboard!');
                          }}
                          className="px-3 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 font-medium"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedUser.status}
                      onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </motion.div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditUser}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}