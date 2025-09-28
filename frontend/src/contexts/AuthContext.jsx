import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Use the configured api instance instead of axios

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token is still valid
      api.get('/api/admin/submissions?limit=1')
        .then(() => {
          const adminData = localStorage.getItem('adminData');
          if (adminData) {
            setAdmin(JSON.parse(adminData));
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/admin/login', { email, password });
    const { token, admin } = response.data;
    
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(admin));
    setAdmin(admin);
    
    return response.data;
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
};