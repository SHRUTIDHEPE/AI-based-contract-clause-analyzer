import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "../api/auth";

// Create a context
export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // This API call should have credentials included (like cookies)
        const response = await getCurrentUser();
        const currentUser = response.data.data; // Adjusted based on controller
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const loggedInUser = response.data.data.user; // Adjusted based on controller
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // Assuming registration does not automatically log the user in
      const response = await registerApi(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi(); // Clears httpOnly cookie on the backend
    } catch (error) {
      console.error("Backend logout failed, clearing client-side state anyway.", error);
    } finally {
      // Always clear client-side state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};