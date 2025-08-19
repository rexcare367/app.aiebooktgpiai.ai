import React from "react";
import Router from "./router/index";
import Loading from "./components/loading/component";
import { AuthProvider, useAuthContext } from "./components/auth/AuthProvider";
import AuthContainer from "./components/auth/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-full flex justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  return <Router />;
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="648244696329-6crqrla61rj2jvf1fs2d1kovnmmtu52q.apps.googleusercontent.com">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
