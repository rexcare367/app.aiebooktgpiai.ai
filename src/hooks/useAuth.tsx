import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  signIn,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  confirmSignUp,
  resendSignUpCode
} from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import AWS from 'aws-sdk';

// Configure AWS SDK globally
AWS.config.update({
  region: 'ap-southeast-2',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!
  })
});

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  // const [signInData, setSignInData] = useState(null);

  const history = useHistory();

  const checkAuthState = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setIsAuthenticated(true);
      setUser({ ...currentUser, attributes });
      // console.log("Current user:", currentUser, "Attributes:", attributes);
      return true;
    } catch (error) {
      console.log("Not authenticated", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();

    const listener = Hub.listen("auth", (data) => {
      const { event } = data.payload;
      if (event === "signedIn") {
        checkAuthState();
      } else if (event === "signedOut") {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => listener();
  }, [checkAuthState]);

  const handleSignIn = async (email, password) => {
    setError(null);
    try {
      const signInResult: any = await signIn({
        username: email,
        password,
      });

      console.log("Sign in result:", signInResult);
      // setSignInData(signInResult);

      if (signInResult.isSignedIn) {
        await checkAuthState();
        // navigate('/dashboards/default');
        history.push("/manage/books");
      }

      return signInResult;
    } catch (error) {
      const err: any = error;
      console.error("Sign in error:", error);
      if (err.name === "UserAlreadyAuthenticatedException") {
        const isAuth = await checkAuthState();
        if (isAuth) {
          // history.push('/manage/books')
          window.location.href = "/#/manage/home";
          return { isSignedIn: true };
        }
      }
      setError(err.message);
      throw error;
    }
  };

  const completeSignIn = async (newPassword, userAttributes = {}) => {
    setError(null);
    try {
      console.log("Completing sign in with new password and attributes:", userAttributes);

      const result = await confirmSignIn({
        challengeResponse: newPassword,
        options: {
          userAttributes,
        },
      });

      console.log("Confirm sign in result:", result);

      if (result.isSignedIn) {
        await checkAuthState();
        // navigate('/dashboards/default');
      }

      return result;
    } catch (error) {
      const err: any = error;
      console.error("Complete sign in error:", error);
      setError(err.message);
      throw error;
    }
  };

  const handleSignUp = async (icNumber, password, email, name, phone_number, guardianName, address) => {
    try {
      setError(null);
      const dynamoDB = new AWS.DynamoDB.DocumentClient({
        region: process.env.REACT_APP_AWS_DYNAMODB_REGION!
      });

      const params = {
        TableName: 'IC_Numbers',
        Key: {
          icNumber: icNumber
        }
      };

      try {
        const result = await dynamoDB.get(params).promise();
        
        if (!result.Item) {
          setError("That IC Number is not registered");
          throw new Error('IC Number not found in the database. Sign up is not allowed.');
        }
        console.log('result', result)

        // Create user with admin API
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

        // Verify that UserPoolId exists
        const userPoolId = process.env.REACT_APP_AWS_USER_POOLS_ID;
        if (!userPoolId) {
          throw new Error('User Pool ID is not configured');
        }

        await cognitoIdentityServiceProvider.adminCreateUser({
          UserPoolId: userPoolId,
          Username: icNumber,
          TemporaryPassword: password,
          MessageAction: 'SUPPRESS',
          UserAttributes: [
            {
              Name: 'email',
              Value: email
            },
            {
              Name: 'name',
              Value: name
            },
            {
              Name: 'phone_number',
              Value: phone_number
            },
            {
              Name: 'address',
              Value: address
            },
            {
              Name: 'custom:guardianName',
              Value: guardianName
            },
            {
              Name: 'email_verified',
              Value: 'true'
            }
          ]
        }).promise();

        // Set permanent password
        await cognitoIdentityServiceProvider.adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: icNumber,
          Password: password,
          Permanent: true
        }).promise();

        // Try to sign in
        try {
          const signInResult = await handleSignIn(icNumber, password);
          return { isSignUpComplete: true, signInResult };
        } catch (signInError) {
          console.log("Auto sign-in failed:", signInError);
          return { isSignUpComplete: true };
        }
        
      } catch (error) {
        console.error('Error during signup:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("That IC Number is not registered");
        }
        throw error;
      }

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw error;
    }
  };

  const handleConfirmSignUp = async (email, verificationCode) => {
    console.log('email, verificationCode', email, verificationCode)
    setError(null);
    const confirmSignUpResult: any = await confirmSignUp({username: email, confirmationCode:verificationCode});

    console.log("confirmSignUpResult:", confirmSignUpResult);
    return confirmSignUpResult;
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    signIn: handleSignIn,
    completeSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    resendSignUpCode,
    signOut: async () => {
      try {
        // switchUserPool(poolType);
        await signOut();
        setIsAuthenticated(false);
        setUser(null);
        // navigate('/authentication/sign-in/basic');
      } catch (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    },
    checkAuthState,
  };
};
