import { createContext, useContext, useState, ReactNode } from "react";

export interface Admin {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  adminLogin: (adminData: Admin) => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });

  const adminLogin = (adminData: Admin) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return ctx;
};
