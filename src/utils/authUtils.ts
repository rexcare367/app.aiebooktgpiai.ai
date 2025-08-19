import { useState, useEffect } from "react";
import authService, { UserData } from "./authService";

// Hook to get current user ID from our auth service
export const useCurrentUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userData = authService.getUserData();
    setUserId(userData?.id || null);
  }, []);

  return userId;
};

// Hook to get current user email from our auth service
export const useCurrentUserEmail = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const userData = authService.getUserData();
    setUserEmail(userData?.email || null);
  }, []);

  return userEmail;
};

// Hook to get current user name from our auth service
export const useCurrentUserName = () => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const userData = authService.getUserData();
    setUserName(userData?.name || null);
  }, []);

  return userName;
};

// Hook to get current user data from our auth service
export const useCurrentUser = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = authService.getUserData();
    setUser(userData);
  }, []);

  return user;
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return isAuthenticated;
};
