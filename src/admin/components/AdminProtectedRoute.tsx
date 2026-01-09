import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const AdminProtectedRoute = ({ children }: Props) => {
  const hardcodedAdmin = {
    email: "admin@example.com",
    password: "admin123"
  };
  
  // Check if admin already logged in
  const isAdminLoggedIn = localStorage.getItem("adminToken");
  
  // Or check for query params for one-time access
  const urlParams = new URLSearchParams(window.location.search);
  const secretKey = urlParams.get('admin_key');  

  if (!isAdminLoggedIn && secretKey !== "YOUR_SECRET_KEY") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If secret key is used, automatically log in
  if (secretKey === "YOUR_SECRET_KEY" && !isAdminLoggedIn) {
    localStorage.setItem("adminToken", "hardcoded-admin-token");
  }

  // if (!isAdminLoggedIn) {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }
  
  return children;
};

export default AdminProtectedRoute;
