import React, { useState, useEffect } from "react";
import WelcomeDialog from "../../components/dialogs/welcomeDialog";
// ... other imports ...

const App: React.FC = () => {
  const [isWelcomeVisible, setWelcomeVisible] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      setWelcomeVisible(true);
      sessionStorage.setItem("hasVisited", "true");
    }
  }, []);

  const handleCloseWelcome = () => {
    setWelcomeVisible(false);
  };

  return (
    <>
      <WelcomeDialog isVisible={isWelcomeVisible} onClose={handleCloseWelcome} />
      {/* ... rest of your app components ... */}
    </>
  );
};

export default App;
