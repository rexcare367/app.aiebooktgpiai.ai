import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import authService, { UserData } from "../../utils/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  google_login: (email: string) => Promise<void>;
  signup: (
    icNumber: string,
    password: string,
    email: string,
    name: string,
    phone: string,
    guardianName: string,
    address: string
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (in case of logout from another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = authService.getToken();
      const userData = authService.getUserData();

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ identifier, password });

      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
        // Redirect to main page after successful login
        history.push("/manager");
      } else {
        setError(response.message || "Login failed");
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const google_login = async (email: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.google_login({ email });

      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
        // Redirect to main page after successful login
        history.push("/manager");
      } else {
        setError(response.message || "Login failed");
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    icNumber: string,
    password: string,
    email: string,
    name: string,
    phone: string,
    guardianName: string,
    address: string
  ) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.signup({
        ic_number: icNumber,
        password,
        phone,
        email,
      });

      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
        // Redirect to main page after successful signup
        history.push("/manager");
      } else {
        setError(response.message || "Signup failed");
        throw new Error(response.message || "Signup failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    google_login,
    signup,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
