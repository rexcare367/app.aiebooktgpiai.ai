import React, { useState } from "react";
import { useAuthContext } from "./AuthProvider";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { error } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      // Placeholder: integrate with backend when available
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMessage("If an account exists for this email, a password reset link has been sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset link.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Remembered your password?{" "}
        <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-500">
          Back to Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
