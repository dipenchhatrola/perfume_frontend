import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminLayout = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Redirect safely (no render-time navigation)
  useEffect(() => {
    if (!admin) {
      navigate("/admin/login");
    }
  }, [admin, navigate]);

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "md:ml-72" : "md:ml-20"
        }`}
      >
        <AdminNavbar
          admin={admin}
          notificationsCount={3}
          onLogout={() => {
            adminLogout();
            navigate("/admin/login");
          }}
          onSearch={(value) => console.log("Search:", value)}
          onNotificationClick={() => console.log("Notification clicked")}
          onProfileClick={() => navigate("/admin/profile")}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;