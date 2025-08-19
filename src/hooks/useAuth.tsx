import { useState, useEffect, useCallback } from "react";
import authService, { LoginRequest, SignupRequest, UserData } from "../utils/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      setLoading(true);
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
      console.error("Auth state check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const credentials: LoginRequest = {
        identifier: email,
        password: password,
      };

      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
        authService.setUserData(response.data);
        return { isSignedIn: true };
      } else {
        setError(response.message || "Login failed");
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError((error as any).message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeSignIn = async (newPassword: string, userAttributes = {}) => {
    setError(null);
    try {
      // This function is kept for compatibility but doesn't apply to our custom auth
      return { isSignedIn: isAuthenticated };
    } catch (error) {
      console.error("Complete sign in error:", error);
      setError((error as any).message);
      throw error;
    }
  };

  const handleSignUp = async (
    icNumber: string,
    password: string,
    email: string,
    name: string,
    phone_number: string,
    guardianName: string,
    address: string
  ) => {
    try {
      setError(null);
      setLoading(true);

      const userData: SignupRequest = {
        ic_number: icNumber,
        password: password,
        phone: phone_number,
        email: email,
      };

      const response = await authService.signup(userData);

      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
        authService.setUserData(response.data);
        return { isSignUpComplete: true };
      } else {
        setError(response.message || "Signup failed");
        throw new Error(response.message || "Signup failed");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (email: string, verificationCode: string) => {
    console.log("email, verificationCode", email, verificationCode);
    setError(null);
    // Email verification is handled by the backend, so we just return success
    return { isConfirmed: true };
  };

  const resendSignUpCode = async (email: string) => {
    // This would need to be implemented if the backend supports it
    return { isResent: true };
  };

  const signOut = async () => {
    try {
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user: user
      ? {
          id: user.id,
          email: user.email,
          attributes: {
            email: user.email,
            name: user.name,
            ic_number: user.ic_number,
            registration_status: user.registration_status,
          },
        }
      : null,
    loading,
    error,
    signIn: handleSignIn,
    completeSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    resendSignUpCode,
    signOut,
    checkAuthState,
  };
};
