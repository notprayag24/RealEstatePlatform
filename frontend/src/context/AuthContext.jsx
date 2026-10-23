// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, setAuthToken, removeAuthToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(token);
        
        const response = await authService.getProfile();
        if (response && response.success) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          // Profile fetch failed, but we still have the token
          // Keep the stored user data
          console.log('Profile fetch failed, using stored user data');
        }
      } catch (err) {
        console.error('Auth error:', err);
        // Don't clear token if profile fetch fails - user might still be valid
        // Only clear if we get a 401
        if (err.response && err.response.status === 401) {
          removeAuthToken();
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };
  loadUser();
}, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      
      console.log('📥 Login response:', response);
      
      // Extract token and user from response
      const token = response.token;
      const user = response.data?.user || response.user;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        setUser(user);
        console.log('✅ Token stored successfully!');
        return { success: true };
      } else {
        console.error('❌ No token in response:', response);
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      const token = response.token;
      const user = response.data?.user || response.user;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        setUser(user);
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      removeAuthToken();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;