import { createContext, useContext, useEffect, useState } from 'react';
import { adminAuthAPI, ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../services/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const saved = localStorage.getItem(ADMIN_USER_KEY);
    if (token && saved) {
      setAdmin(JSON.parse(saved));
      adminAuthAPI.getMe().catch(() => logout());
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { data } = await adminAuthAPI.login({ email, password });
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    const adminData = { _id: data._id, name: data.name, email: data.email };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
