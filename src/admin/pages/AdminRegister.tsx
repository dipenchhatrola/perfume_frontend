import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔐 API CALL
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Admin Name"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800">
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already Admin?{" "}
          <Link to="/admin/login" className="font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
