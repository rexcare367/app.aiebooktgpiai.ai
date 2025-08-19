import React, { useState } from "react";

interface CustomAuthenticatorProps {
  children: (props: { signOut?: () => void; user?: any }) => React.ReactNode;
}

const CustomAuthenticator: React.FC<CustomAuthenticatorProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleSignIn = async (email: string, password: string) => {
    // Simple mock authentication
    if (email && password) {
      const mockUser = {
        id: "1",
        email: email,
        name: email.split("@")[0],
        attributes: {
          email: email,
          name: email.split("@")[0],
        },
      };

      localStorage.setItem("user", JSON.stringify(mockUser));
      setIsAuthenticated(true);
      setUser(mockUser);
      return { isSignedIn: true };
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const handleSignUp = async (icNumber: string, password: string, email: string, name: string) => {
    // Simple mock signup
    if (icNumber && password && email) {
      const mockUser = {
        id: icNumber,
        email: email,
        name: name,
        attributes: {
          email: email,
          name: name,
        },
      };

      localStorage.setItem("user", JSON.stringify(mockUser));
      setIsAuthenticated(true);
      setUser(mockUser);
      return { isSignUpComplete: true };
    } else {
      throw new Error("Missing required fields");
    }
  };

  const signOut = () => {
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if user is already authenticated on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUser(userData);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50" />

        {/* Main content */}
        <div className="relative w-full max-w-md">
          {/* Decorative border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 opacity-30 animate-gradient" />

          <div className="relative z-10 bg-white rounded-2xl shadow-lg border-none px-6 py-8">
            <div className="text-center pb-6">
              <div className="w-48 h-48 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 blur-xl opacity-50"></div>
                <img src="/assets/empty_light.svg" alt="Welcome" className="relative w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold px-6">
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Welcome to AI Ebook Reader! 👋
                </span>
              </h3>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your email"
                className="w-full border border-gray-200 rounded-xl h-12 px-4 focus:border-purple-300 focus:ring-0"
                id="auth-email"
              />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-xl h-12 px-4 focus:border-purple-300 focus:ring-0"
                id="auth-password"
              />
              <button
                onClick={() => {
                  const email = (document.getElementById("auth-email") as HTMLInputElement).value;
                  const password = (document.getElementById("auth-password") as HTMLInputElement).value;
                  handleSignIn(email, password).catch(console.error);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-white h-12 font-medium transition-all hover:opacity-90"
              >
                Sign In
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm opacity-70">&copy; All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children({ signOut, user })}</>;
};

export default CustomAuthenticator;
