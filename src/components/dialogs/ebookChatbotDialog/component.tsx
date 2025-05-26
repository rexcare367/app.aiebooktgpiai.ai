import React, { useState } from "react";
import { ebookChatbotDialogProps } from "./interface";
import EbookChatbotWidget from "./ebookChatbotWidget";
import "./ebookChatbot.css";

const EbookChatbotDialog: React.FC<ebookChatbotDialogProps> = ({ 
  isOpen = false,
  onClose,
  defaultInput = "",
  currentTitle = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isOpen) return null;

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="chatbot-dialog-container">
      <button 
        onClick={handleCollapse}
        className="chatbot-collapse-button"
      >
        {isCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
      </button>

      {!isCollapsed && (
        <EbookChatbotWidget 
          customStyle={{}}
          defaultInput={defaultInput}
          currentTitle={currentTitle}
        />
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="chatbot-close-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default EbookChatbotDialog;