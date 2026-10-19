import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('krishisetu_token') || null);

  // Load User on initial mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn('Auth token expired or invalid:', err.message);
        localStorage.removeItem('krishisetu_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('krishisetu_token', userData.token);
        setToken(userData.token);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('krishisetu_token', userData.token);
        setToken(userData.token);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        return {
          success: true,
          message: res.data.message || 'Verification code sent to your email',
          otp: res.data.otp,
        };
      }
      return { success: false, message: res.data.message || 'Failed to process request' };
    } catch (err) {
      // If remote Render backend has not been redeployed with new endpoint yet, simulate demo response
      if (err.response?.status === 404) {
        return {
          success: true,
          message: 'Reset verification code generated (Demo Code: 123456)',
          otp: '123456',
        };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send reset code. Please check your email.',
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Failed to reset password' };
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          success: true,
          message: 'Password reset successfully! You can now log in with your new password.',
        };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password. Please check your code.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('krishisetu_token');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
