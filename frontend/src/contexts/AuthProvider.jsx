import React, { useState, useEffect } from 'react';
import AuthContext from './authContext';
import api from '../services/api';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          // Verify token is still valid
          const response = await api.get('/api/admin/submissions?limit=1');
          const adminData = localStorage.getItem('adminData');
          if (adminData) {
            setAdmin(JSON.parse(adminData));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/admin/login', { email, password });
      const { token, admin: adminInfo } = response.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminInfo));
      setAdmin(adminInfo);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  const value = {
    admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
