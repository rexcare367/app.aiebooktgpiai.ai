import React, { useState } from "react";
import { useAuthContext } from "./AuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Loading from "../loading/component";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onSwitchToForgot }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { google_login, login, error, loading } = useAuthContext();

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(identifier, password);
    } catch (error) {
      console.error("Login error:", error);
    } 
  };

  const handleGoogleLogin = async (credential: string) => {
    const decoded: any = jwtDecode(credential);
    const { email } = decoded;

    try {
      await google_login(email);
    } catch (error) {
      console.error("Login error:", error);
    } 
  };

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 rounded-2xl z-10 flex items-center justify-center">
          <Loading />
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-6">
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Sign in</h2>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const { credential } = credentialResponse;
            handleGoogleLogin(credential || "");
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-4 text-gray-500 text-sm">Continue with Email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form className="space-y-6" onSubmit={handleLoginWithEmail}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email/Username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              Remember me
            </label>
            <button type="button" onClick={onSwitchToForgot} className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Don’t have account?{" "}
          <button onClick={onSwitchToSignup} className="text-indigo-600 hover:text-indigo-500">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
