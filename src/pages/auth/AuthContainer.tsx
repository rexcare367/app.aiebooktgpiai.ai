import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useAuthContext } from "./AuthProvider";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthContainerProps {
  initialView?: "login" | "signup" | "forgot";
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialView = "login" }) => {
  const [view, setView] = useState<"login" | "signup" | "forgot">(initialView);
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const switchToSignup = () => setView("signup");
  const switchToLogin = () => setView("login");
  const switchToForgot = () => setView("forgot");

  return (
    <div className="min-h-screen w-full h-full p-6 bg-gray-50 flex items-center justify-center">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="w-full mx-auto overflow-y-auto pr-1 flex items-center justify-center max-w-xl">
          {view === "login" && <LoginForm onSwitchToSignup={switchToSignup} onSwitchToForgot={switchToForgot} />}
          {view === "signup" && <SignupForm onSwitchToLogin={switchToLogin} />}
          {view === "forgot" && <ForgotPasswordForm onSwitchToLogin={switchToLogin} />}
        </div>
        <div className="hidden lg:block w-full">
          <div className="relative w-full h-full min-h-[640px] rounded-2xl overflow-hidden shadow-lg bg-gray-900">
            <img
              src="/assets/SKTP.png"
              alt="Welcome visual"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gray-900/40" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-gray-100">
              <p className="text-lg md:text-xl font-medium italic">
                “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
              </p>
              <p className="mt-2 text-sm text-gray-300">— George R. R. Martin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
