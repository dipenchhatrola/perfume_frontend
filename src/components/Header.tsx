import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();
  

  // Page load पर local storage से user data check करें
  useEffect(() => {
    const savedUser = localStorage.getItem('perfume_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  //const isLoggedIn = !!user;
  const isLoggedIn = localStorage.getItem('perfume_user') !== null;

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    // Local storage से user data remove करें
    localStorage.removeItem('perfume_user');
    setUser(null);
    closeMenu();
    // Page refresh करें (optional)
    window.location.href = '/';
  };

  return (
    <header>
      <nav className="sticky w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif tracking-[0.6em] uppercase">
            perfume
            <p className="text-[10px] uppercase tracking-[0.4em] font-serif">Signature Fragrances</p>
          </Link>
          

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-12 text-[10px] uppercase tracking-[0.2em]">
            <Link to="/" className="hover:text-stone-500 transition">Home</Link>
            <Link to="/products" className="hover:text-stone-500 transition">Collection</Link>
            <Link to="/about-us" className="hover:text-stone-500 transition">About Us</Link>
            <Link to="/contact-us" className="hover:text-stone-500 transition">Contact Us</Link>
            {/* {isLoggedIn && (
              <Link to="/orders" className="hover:text-stone-500 transition">Orders</Link>
            )} */}
          </div>

          {/* Icons & Mobile Toggle */}
          <div className="flex items-center space-x-6">
            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative">
              <ShoppingBag size={20} className="text-gray-700 hover:text-gray-900" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* User Icon */}
            {isLoggedIn ? (
              <Link to="/profile">
                <User size={20} className="text-gray-700 hover:text-gray-900" />
              </Link>
            ) : (
              <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">
                LOGIN
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 flex flex-col p-6 space-y-4 text-[10px] uppercase tracking-[0.2em]">
            <Link to="/" onClick={closeMenu} className="py-2">Home</Link>
            <Link to="/collection" onClick={closeMenu} className="py-2">Collection</Link>
            <Link to="/about-us" onClick={closeMenu} className="py-2">About Us</Link>
            <Link to="/contact-us" onClick={closeMenu} className="py-2">Contact Us</Link>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile"
                  onClick={closeMenu}
                  className="py-2 text-left hover:text-stone-500 transition flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile ({user?.firstName})
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 text-left hover:text-red-600 transition flex items-center text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                onClick={closeMenu}
                className="py-2 text-left hover:text-stone-500 transition"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;