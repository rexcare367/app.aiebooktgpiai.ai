import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, poolType }) => {
  // For local auth, we don't need AWS configuration
  return <AuthContext.Provider value={{ poolType }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  poolType: PropTypes.oneOf(["admin", "user"]).isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
