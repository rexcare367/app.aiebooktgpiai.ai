import React, {FC} from "react";
import Router from "./router/index";
import { AuthProvider, useAuthContext } from "./pages/auth/AuthProvider";
import AuthContainer from "./pages/auth/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const AppContent: FC = () => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  return <Router />;
};

const App: FC = () => {
  return (
    <GoogleOAuthProvider clientId="648244696329-6crqrla61rj2jvf1fs2d1kovnmmtu52q.apps.googleusercontent.com">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
