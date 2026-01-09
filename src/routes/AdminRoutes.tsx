import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../admin/pages/AdminDashboard";
import Orders from "../admin/pages/AdminOrders";
import Products from "../admin/pages/AdminProducts";
import Users from "../admin/pages/AdminUsers";
import AdminLogin from "../admin/pages/AdminLogin";
import AdminRegister from "../admin/pages/AdminRegister";
import AdminLayout from "../admin/components/AdminLayout";
import { AdminAuthProvider } from "context/AdminAuthContext";

export default function AdminRoutes() {
  return (
    <AdminAuthProvider> 
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="login" element={<AdminLogin />} />
        <Route path="register" element={<AdminRegister />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}