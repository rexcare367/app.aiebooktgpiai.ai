import React, { useState } from "react";
import Signin from "./signin";
import Signup from "./signup";
import WelcomeScreen from "../../components/welcomeScreen";
// import { useAuth } from "./hooks/useAuth";

const Auth = () => {
  const [isSignin, setIsSignin] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const [showWelcome, setShowWelcome] = useState(true);

  const handleTransition = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 500);
  };

  // <WelcomeScreen onClose={handleTransition} isExiting={isExiting} />
  return (
    <>
      {showWelcome ? (
        <WelcomeScreen onClose={handleTransition} isExiting={isExiting} />
      ) : isSignin ? (
        <Signin setIsSignin={setIsSignin} />
      ) : (
        <Signup setIsSignin={setIsSignin} />
      )}
    </>
  );
};

export default Auth;
