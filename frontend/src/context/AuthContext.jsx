import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('stockcloud_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stockcloud_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('stockcloud_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('stockcloud_token', res.data.token);
      localStorage.setItem('stockcloud_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('stockcloud_token', res.data.token);
      localStorage.setItem('stockcloud_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stockcloud_token');
    localStorage.removeItem('stockcloud_user');
  };

  const updateUserOrg = (updatedOrg) => {
    if (user) {
      const updatedUser = { ...user, organization: updatedOrg };
      setUser(updatedUser);
      localStorage.setItem('stockcloud_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserOrg,
        isAdmin: user?.role === 'ADMIN',
        isManager: user?.role === 'MANAGER' || user?.role === 'ADMIN',
        isStaff: user?.role === 'STAFF',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
