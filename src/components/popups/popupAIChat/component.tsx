import React, { useState, useEffect } from "react";
import ChatbotWidget from "../../../components/dialogs/chatbotDialog/chatbotWidget";
import { getIframeDoc } from "../../../utils/serviceUtils/docUtil";
import axios from "axios";
import "./popupAIChat.css";

interface PopupAIChatProps {
  handleOpenMenu: (isOpen: boolean) => void;
  handleMenuMode: (mode: string) => void;
  handleNoteKey: (key: string) => void;
  currentBook: { name: string };
}

const PopupAIChat: React.FC<PopupAIChatProps> = ({ handleOpenMenu, handleMenuMode, handleNoteKey, currentBook }) => {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const textArea = document.querySelector(".editor-box") as HTMLElement;
    (textArea as HTMLElement & { focus: () => void })?.focus();

    const doc = getIframeDoc();
    if (!doc) return;

    let selectedText = doc.getSelection()?.toString() || "";

    selectedText = selectedText
      .normalize("NFC")
      .replace(/\s\s/g, " ")
      .replace(/[\r\n\t\f]/g, " ");

    setText(selectedText);

    // Cleanup audio on unmount
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  const handleClose = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    handleOpenMenu(false);
    handleMenuMode("");
    handleNoteKey("");
  };

  const playAudio = (url: string) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    const player = new Audio(url);
    player.play();
    setAudioPlayer(player);
  };

  const customStyle = {
    chat: {
      right: "0px",
      height: "500px",
      width: "500px",
      position: "static" as const,
      bottom: "0",
      left: "calc(50% - 250px)",
      zIndex: 10,
    },
    messages: {
      scrollbarWidth: "thin",
      userSelect: "text",
      WebkitUserSelect: "text",
      cursor: "text",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", sans-serif',
      height: "calc(100% - 60px)",
      overflowY: "auto",
    },
  };

  const defaultInput = `I'm reading a book and its title is "${currentBook.name}". I highlighted this text: "${text}"`;

  const handleMessage = async (message: string, messages: any[]) => {
    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(messages));

      const response = await axios.post("/api/audio/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.attachment) {
        setAudioUrl(response.data.attachment);
        playAudio(response.data.attachment);
      }
    } catch (error) {
      console.error("Error getting audio response:", error);
    }
  };

  return (
    <div className="chat" style={customStyle.chat}>
      <div className="popup-header">
        <div className="popup-header-text">
          {text && text.trim() ? (
            <span className="popup-header-text-highlight" title={text}>
              {text.length > 50 ? `${text.substring(0, 50)}...` : text}
            </span>
          ) : (
            <span>AI Assistant</span>
          )}
        </div>
        <button onClick={handleClose} className="close-button" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <ChatbotWidget
        handleShow={handleClose}
        customStyle={customStyle}
        defaultInput={defaultInput}
        onClose={handleClose}
        onMessage={handleMessage}
      />
    </div>
  );
};

export default PopupAIChat;
