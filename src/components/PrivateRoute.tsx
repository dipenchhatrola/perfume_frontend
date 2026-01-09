import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Check if user is logged in (localStorage में user data है या नहीं)
  const isAuthenticated = localStorage.getItem('perfume_user') !== null;

  if (!isAuthenticated) {
    // अगर user logged in नहीं है, तो login page पर redirect करो
    return <Navigate to="/login" replace />;
  }

  // अगर logged in है, तो requested component show करो
  return <>{children}</>;
};

export default PrivateRoute;