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
          // Verify token is still valid using dedicated auth endpoint
          const response = await api.get('/api/admin/verify');
          if (response.data.success) {
            // Use admin data from verification response
            setAdmin(response.data.admin);
          } else {
            throw new Error('Token verification failed');
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
