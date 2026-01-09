// pages/Notifications.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Tag, Package, Star, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationType = 'order' | 'promotion' | 'review' | 'system';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return <Package className="text-blue-500" size={20} />;
    case 'promotion':
      return <Tag className="text-purple-500" size={20} />;
    case 'review':
      return <Star className="text-yellow-500" size={20} />;
    case 'system':
      return <Settings className="text-gray-500" size={20} />;
    default:
      return <Bell size={20} />;
  }
};

const formatTime = (date: string) =>
  new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const userId = 'USER_ID_HERE'; // 🔥 auth ke baad dynamic karna

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  /* ---------------- FETCH ---------------- */
  const fetchNotifications = async () => {
    const res = await fetch(
      `https://perfume-signaturefragrance-backend.vercel.app/api/notifications/${userId}`
    );
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const markAsRead = async (id: string) => {
    await fetch(`https://perfume-signaturefragrance-backend.vercel.app/api/notifications/read/${id}`, {
      method: 'PUT'
    });

    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch(
      `https://perfume-signaturefragrance-backend.vercel.app/api/notifications/read-all/${userId}`,
      { method: 'PUT' }
    );

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <motion.div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Bell size={28} />
            <div>
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-gray-700"
          >
            ← Back
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between px-6 py-4 border-b">
            <h2 className="font-medium">Recent</h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600"
              >
                Mark all as read
              </button>
            )}
          </div>

          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`px-6 py-4 border-b ${
                  !n.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {getIcon(n.type)}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{n.title}</h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{n.message}</p>

                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="text-sm text-blue-600 mt-2"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
