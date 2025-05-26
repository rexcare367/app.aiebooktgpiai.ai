import React, { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, poolType }) => {
  useEffect(() => {
    // Initialize Amplify with the appropriate configuration using environment variables
    const config = {
      Auth: {
        Cognito: {
          userPoolId: poolType === 'admin' ? process.env.REACT_APP_ADMIN_POOL_ID : process.env.REACT_APP_USER_POOL_ID,
          userPoolClientId: poolType === 'admin' ? process.env.REACT_APP_ADMIN_CLIENT_ID : process.env.REACT_APP_USER_CLIENT_ID,
          signUpVerificationMethod: 'code',
        }
      }
    };

    Amplify.configure(config);
    cognitoUserPoolsTokenProvider.setKeyValueStorage(window.localStorage);
  }, [poolType]);

  return (
    <AuthContext.Provider value={{ poolType }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  poolType: PropTypes.oneOf(['admin', 'user']).isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};