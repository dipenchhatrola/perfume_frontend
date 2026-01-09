import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔐 FUTURE: Backend API call
    if (formData.email && formData.password) {
      const adminFromAPI = {
        id: "1",
        name: "Dipen Chhatrola",
        role: "Super Admin",
        avatar: "https://i.pravatar.cc/150?img=12",
        email: formData.email,
      };

      adminLogin(adminFromAPI);     // ✅ store admin
      navigate("/admin/dashboard"); // ✅ redirect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />

          <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800">
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          New Admin?{" "}
          <Link to="/admin/register" className="font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
