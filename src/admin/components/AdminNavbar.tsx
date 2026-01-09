import { Bell, Search, LogOut, ChevronDown, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface Admin {
  name: string;
  role: string;
  avatar: string;
}

interface AdminNavbarProps {
  admin: Admin;
  notificationsCount: number;
  onLogout: () => void;
  onSearch: (value: string) => void;
  onNotificationClick: () => void;
  onProfileClick: () => void;
}

export default function AdminNavbar({
  admin,
  notificationsCount,
  onLogout,
  onSearch,
  onNotificationClick,
  onProfileClick,
}: AdminNavbarProps) {
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-4 mt-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/40">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          {/* LEFT */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Menu Button - Hidden on desktop */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {/* You can add sidebar toggle here if needed */}}
            >
              <Menu size={24} className="text-gray-600" />
            </motion.button>

            {/* <motion.h1
              whileHover={{ scale: 1.03 }}
              className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer"
            >
              Admin Panel
            </motion.h1> */}

            {/* Search for Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <Search size={18} className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search anything..."
                className="bg-transparent outline-none text-sm w-56 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Search Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search size={20} className="text-gray-600" />
            </motion.button>

            {/* Notification */}
            <motion.button
              onClick={onNotificationClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="p-2 md:p-2.5 rounded-xl bg-gray-100/60 hover:bg-gray-200 transition">
                <Bell size={18} />
              </div>

              {notificationsCount > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] text-white shadow"
                >
                  {notificationsCount}
                </motion.span>
              )}
            </motion.button>

            {/* Profile - Hide on mobile, show on tablet+ */}
            <motion.div
              onClick={onProfileClick}
              whileHover={{ y: -2 }}
              className="hidden sm:flex items-center gap-3 md:gap-4 cursor-pointer group"
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur"
                />
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="relative h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-white object-cover"
                />
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-semibold leading-none">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500">{admin.role}</p>
              </div>

              <ChevronDown size={16} className="text-gray-500" />
            </motion.div>

            {/* Logout */}
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm text-red-500 bg-red-50 hover:bg-red-100 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <Search size={18} className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search anything..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}