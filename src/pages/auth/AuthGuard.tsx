import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { useAuthContext } from "./AuthProvider";
import Loading from "../../components/loading/component";

interface AuthGuardProps extends RouteProps {
  component: React.ComponentType<any>;
  fallbackPath?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ component: Component, fallbackPath = "/", ...rest }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <Loading />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: fallbackPath,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

// Public route component for login/signup pages
interface PublicRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  fallbackPath?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  fallbackPath = "/manager",
  ...rest
}) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <Loading />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: fallbackPath,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};
