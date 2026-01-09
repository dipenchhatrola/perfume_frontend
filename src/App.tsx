// App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// USER PAGES
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProductsPage from './pages/Products';
import Orders from './pages/Orders';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import HomePage from './pages/HomePage';
import AboutPage from './components/Aboutus';
import ContactPage from './components/Contactus';
import PaymentMethods from './pages/PaymentMethods';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Wishlist from './pages/Wishlist';

// ADMIN ROUTES
import AdminRoutes from './routes/AdminRoutes';

/* ---------------------------------- */
/* Header Wrapper (Admin pe hide) */
/* ---------------------------------- */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <CartProvider>
          <WishlistProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="light"
            />

            <Layout>
              <Routes>
                {/* USER ROUTES */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />                
                <Route path="/about-us" element={<AboutPage />} />
                <Route path="/contact-us" element={<ContactPage />} />

                {/* PROTECTED USER ROUTES */}
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/payment-methods"
                  element={
                    <PrivateRoute>
                      <PaymentMethods />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />

                {/* 🔐 ADMIN PANEL ROUTES */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </WishlistProvider>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
