import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

function SignUp({ setIsSignin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { signUp, confirmSignUp, error, resendSignUpCode } = useAuth();

  // Function to format phone number for Cognito
  const formatPhoneForCognito = (phoneNumber) => {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    // If the number starts with '0', remove it
    const cleanNumber = digits.startsWith("0") ? digits.substring(1) : digits;

    // Add the +60 prefix
    return `+60${cleanNumber}`;
  };

  // Function to handle phone number input
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Only allow digits
    const digits = input.replace(/\D/g, "");
    setPhone(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Validate phone number
    if (phone.length < 9 || phone.length > 11) {
      alert("Please enter a valid Malaysian phone number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForCognito(phone);
      const signUpResult = await signUp(icNumber, password, email, name, formattedPhone, guardianName, address);
      
      if (signUpResult.signInResult?.isSignedIn) {
        // If auto sign-in was successful, redirect to home
        window.location.href = "/#/manage/home";
      } else {
        setIsConfirming(true);
      }
    } catch (err) {
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const confirmsignupResult = await confirmSignUp(icNumber, verificationCode);
      if (confirmsignupResult.isSignUpComplete === true) setIsSignin(true);
    } catch (err) {
      console.error("Confirmation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen p-4 overflow-auto bg-neutral-800">
      {/* Header Navigation */}
      <div className="flex justify-between w-full max-w-lg rounded-t-lg">
        <button
          className="w-full p-2 text-md md:text-xl xl:text-2xl font-bold text-gray-600 bg-white rounded-tl-lg"
          onClick={() => setIsSignin(true)}
        >
          Sign In
        </button>
        <button
          className="w-full text-md md:text-xl xl:text-2xl font-bold text-purple-700 bg-white rounded-tr-lg hover:text-gray-800"
          onClick={() => setIsSignin(false)}
        >
          Create Account
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg overflow-auto bg-white rounded-b-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4">
            <img src="/assets/empty.svg" alt="Welcome illustration" className="xl:w-36 xl:h-36 w-28 h-28" />
            <h1 className="text-md md:text-xl xl:text-2xl font-semibold text-center">Let&apos;s Be Friends! ⭐</h1>
          </div>

          {/* Form */}
          {!isConfirming ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="full-name" className="block text-sm text-gray-600">
                  Full Name:
                </label>
                <input
                  id="full-name"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ic-number" className="block text-sm text-gray-600">
                  IC Number:
                </label>
                <input
                  id="ic-number"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your IC Number"
                  value={icNumber}
                  onChange={(e) => setIcNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm text-gray-600">
                  E-mail:
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your E-mail Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="guardian" className="block text-sm text-gray-600">
                  Guardian Name:
                </label>
                <input
                  id="guardian"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your Guardian Name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm text-gray-600">
                  Phone Number:
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center md:px-3 md:py-2 px-1 text-sm md:text-md text-gray-500 bg-gray-100 border border-gray-300 rounded-md">
                    +60
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="flex-1 md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your Phone Number (e.g., 1123456789)"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={11}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your number with or without leading zero (e.g., 01123456789 or 1123456789)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm text-gray-600">
                  Address:
                </label>
                <input
                  id="address"
                  type="text"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm text-gray-600">
                  Password:
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must contain at least 1 uppercase and 1 lowercase letter
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-sm text-gray-600">
                  Confirm Password:
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Please confirm your Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div>
                  <p className="py-2 text-white bg-red-500 rounded-md white">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-900 disabled:bg-gray-500"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmation} className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600">Please check your email for the verification code</p>
              </div>
              <div className="input-group">
                <label htmlFor="verification-code" className="block text-sm text-gray-600">
                  Verification Code:
                </label>
                <input
                  type="text"
                  id="verification-code"
                  placeholder="Verification Code"
                  className="w-full md:px-3 md:py-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div>
                  <p className="py-2 text-white bg-red-500 rounded-md white">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
                <button
                  type="button"
                  onClick={() => resendSignUpCode({ username: icNumber })}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  resend code
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-gray-100">
          <button className="text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsSignin(true)}>
            Already Friends? Sign In Here! 😊
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="mt-8 text-sm text-gray-500"> All Rights Reserved</p>
    </div>
  );
}

export default SignUp;
