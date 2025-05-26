import React from "react";

import AuthenticatedApp from "./router/index";
import Auth from "./pages/authentication/auth";
import Loading from "./components/loading/component";

import { useAuth } from "./hooks/useAuth";

import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

const adminConfig: any = {
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_COGNITO_REGION,
      userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID,
      userPoolClientId: process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID,
    },
    region: process.env.REACT_APP_AWS_COGNITO_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID,
  },
};

Amplify.configure(adminConfig);

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      {loading ? (
        <div className="h-full flex justify-center">
          <Loading />
        </div>
      ) : !isAuthenticated ? (
        <Auth />
      ) : (
        <AuthenticatedApp />
      )}
    </>
  );
};

export default App;
