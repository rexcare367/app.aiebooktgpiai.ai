import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function AuthPage({ setIsSignin }) {
  const { signIn, completeSignIn, error: authError, isAuthenticated, checkAuthState } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    // Check if user is already authenticated
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("User is already authenticated");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result: any = await signIn(email, password);
      console.log("Sign in result:", result);

      if (result.isSignedIn) {
        console.log("Successfully signed in");
      }
    } catch (error) {
      const err: any = error;
      console.error("Sign in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result: any = await completeSignIn(newPassword, {
        name,
        address,
      });

      if (result.isSignedIn) {
        console.log("Successfully completed sign in");
      }
    } catch (err) {
      console.error("Password change failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetError("");

    if (!email.trim()) {
      setResetError("Please enter your IC number first");
      setLoading(false);
      return;
    }

    // For local auth, we'll just show a message
    setShowForgotPassword(true);
    setResetError("Password reset functionality is not available in local mode.");
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetError("");

    // For local auth, we'll just show a message
    setShowForgotPassword(false);
    setResetError("Password reset functionality is not available in local mode.");
    setLoading(false);
  };

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log("isAuthenticated", isAuthenticated);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-800">
      {/* Header Navigation */}
      <div className="flex justify-between w-full max-w-lg rounded-t-lg">
        <button
          className="w-full p-2 text-md md:text-xl xl:text-2xl font-bold text-purple-700 bg-white rounded-tl-lg"
          onClick={() => setIsSignin(true)}
        >
          Sign In
        </button>
        <button
          className="w-full text-md md:text-xl xl:text-2xl font-bold text-gray-600 bg-white rounded-tr-lg hover:text-gray-800"
          onClick={() => setIsSignin(false)}
        >
          Create Account
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-b-lg shadow-md">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4">
            <img src="/assets/empty.svg" alt="Welcome illustration" className="xl:w-36 xl:h-36 w-28 h-28" />
            <h1 className="text-md md:text-xl xl:text-2xl font-semibold text-center">Welcome Back Friend! 👋</h1>
          </div>

          {/* Form */}
          {!showNewPasswordForm && !showForgotPassword ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="ic-number" className="block text-sm text-gray-600">
                  Your Special IC Number:
                </label>
                <input
                  id="ic-number"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your IC number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm text-gray-600">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-purple-300"
                >
                  Forgot Password?
                </button>
              </div>
              {(authError || resetError) && (
                <div className="text-red-500 text-sm">
                  <p>{authError || resetError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-900 disabled:bg-gray-500"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : showForgotPassword ? (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label htmlFor="reset-code" className="block text-sm text-gray-600">
                  Reset Code:
                </label>
                <input
                  id="reset-code"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter the code sent to your email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm text-gray-600">
                  New Password:
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {resetError && (
                <div className="text-red-500 text-sm">
                  <p>{resetError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-900 disabled:bg-gray-500"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange}>
              <div>
                <input
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p>
                  Password must be at least 8 characters long and contain numbers, special characters, and both upper
                  and lowercase letters.
                </p>
              </div>
              <div>
                <input
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <div>
                  <p>{authError}</p>
                </div>
              )}
              <div>
                <button
                  className="w-full py-2 text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-900 disabled:bg-gray-500"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password & Profile"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {/* <div className="p-6 text-center border-t border-gray-100">
          <a href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
            Forgot Password? Don&apos;t Worry! 😊
          </a>
        </div> */}
      </div>

      {/* Copyright */}
      <p className="mt-8 text-sm text-gray-500"> All Rights Reserved</p>
    </div>
  );
}
