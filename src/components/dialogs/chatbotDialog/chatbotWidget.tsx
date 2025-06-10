//src/components/dialogs/chatbotDialog/chatbotWidget.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import "./chatbotDialog.css";
import "./chatbotWidget.css";
import TextareaAutosize from "react-textarea-autosize";
import moment from "moment";
import markdownit from "markdown-it";
import { SyncLoader } from "react-spinners";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ReactMic } from "react-mic";
import ReactAudioPlayer from "react-audio-player";
import { ChatbotWidgetProps } from "./interface";
import { CircleXIcon, BotIcon, Send, Mic, CircleStop } from "lucide-react";
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});
const baseURL = process.env.REACT_APP_PUBLIC_BACKEND_URL || "http://localhost:5000";

type IMessage = {
  type: string;
  variant: string;
  text: string;
  attachment: string;
  timestamp: string;
};

export default function ChatbotWidget({
  handleShow,
  customStyle,
  defaultInput = "",
  onClose,
  onMessage,
}: ChatbotWidgetProps) {
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [isChat, setIsChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState(false);
  const [isWaitingAIVoice, setIsWaitingAIVoice] = useState(false);
  const [allContent, setAllContent] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([
    {
      type: "bot",
      variant: "text",
      text: "Hello, I am AI assistant! How can I assist you today?",
      attachment: "",
      timestamp: moment().format("hh:mm"),
    },
  ]);
  const [input, setInput] = useState("");

  // Add styles to enable text selection
  const messageStyles = {
    ...(customStyle?.messages || {}),
    userSelect: "text",
    WebkitUserSelect: "text",
    cursor: "text",
    // Ensure the text remains readable when selected
    "::selection": {
      background: "rgba(0, 123, 255, 0.3)",
      color: "inherit",
    },
  };

  // Rest of your existing handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput(input + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  };

  // Your existing handlers and effects remain the same
  const sendQuestion = () => {
    if (input.trim() === "" || isLoading) return;

    setIsChat(true);
    setIsLoading(true);

    const newMessage: IMessage = {
      type: "user",
      variant: "text",
      text: input,
      attachment: "",
      timestamp: moment().format("hh:mm"),
    };

    setMessages([...messages, newMessage]);
  };

  // Your existing useEffects remain the same
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo(0, 10000000000);
    }
  }, [messages]);

  useEffect(() => {
    if (!isChat) return;
    setInput("");
    let _messages = messages.slice();

    const ctrl = new AbortController();
    fetchEventSource(`${baseURL}/api/langchain/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: _messages,
        defaultInput,
      }),
      signal: ctrl.signal,
      onmessage(msg) {
        if (msg.data) {
          setAllContent((prevContent) => {
            const updatedContent = prevContent + msg.data.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
            setIsLoading(false);
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage.type === "user") {
                return [
                  ...prevMessages,
                  {
                    type: "bot",
                    variant: "text",
                    text: updatedContent,
                    attachment: "",
                    timestamp: moment().format("hh:mm"),
                  },
                ];
              } else if (lastMessage.type === "bot") {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1].text = updatedContent;
                return updatedMessages;
              }
              return prevMessages;
            });
            return updatedContent;
          });
        }
      },
      onclose() {
        setIsChat(false);
        setIsLoading(false);
        setAllContent("");
      },
      onerror() {
        setIsChat(false);
        setIsLoading(false);
        setAllContent("");
      },
    });
  }, [isChat]);

  // Existing audio handling functions
  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
    setIsWaitingAIVoice(true);
  };

  const onData = (recordedBlob: any) => {
    console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = (recordedBlob: any) => {
    const file = new File([recordedBlob.blob], "recording.wav", {
      type: "audio/wav",
    });
    const audioURL = URL.createObjectURL(file);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "user",
        variant: "audio",
        text: "I am sending you a voice message",
        attachment: audioURL,
        timestamp: moment().format("hh:mm"),
      },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    let _messages = messages.slice();
    formData.append("messages", JSON.stringify(_messages));

    setIsLoading(true);
    fetch(`${baseURL}/api/audio/transcribe`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((res) => {
        console.log("res", res);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            variant: "audio",
            text: res.text,
            attachment: res.attachment,
            timestamp: moment().format("hh:mm"),
          },
        ]);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsWaitingAIVoice(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: IMessage = {
      type: "user",
      variant: "text",
      text: input,
      attachment: "",
      timestamp: moment().format("hh:mm"),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    if (onMessage) {
      await onMessage(input, [...messages, newMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat" style={customStyle?.chat}>
      <div className="message-header flex justify-between" style={customStyle?.["message-header"]}>
        <span className="flex flex-row gap-1">
          <BotIcon />
          <Trans>AI Assistant</Trans>
        </span>
        <span onClick={handleShow}>
          <CircleXIcon />
        </span>
      </div>
      <div className="messages" style={messageStyles} ref={messagesRef}>
        {messages.map((msg, index) => {
          return (
            <div key={index} className={`message ${msg.type === "user" ? "message-personal" : "message-bot"}`}>
              <figure className="avatar">
                {msg.type !== "user" ? (
                  <img src="assets/bot_round.png" alt="Bot Avatar" className="bot-avatar" />
                ) : (
                  <svg
                    id="user_avatar_face"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                      style={{ fill: "var(--active-theme-color)" }}
                    />
                  </svg>
                )}
              </figure>

              {msg.variant === "text" ? (
                <div
                  className="message-box-content"
                  style={{
                    cursor: "text",
                    userSelect: "text",
                    WebkitUserSelect: "text",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: md.render(msg.text),
                  }}
                />
              ) : (
                <ReactAudioPlayer style={{ height: "40px", width: "260px" }} src={msg.attachment} autoPlay controls />
              )}
            </div>
          );
        })}
        {((isChat && isLoading) || isWaitingAIVoice) && (
          <div className="message new">
            <figure className="avatar">
              <img src="assets/bot_round.png" alt="Bot Avatar" className="bot-avatar" />
            </figure>
            <SyncLoader size={6} color="grey" loading={isLoading} speedMultiplier={0.7} />
          </div>
        )}
        <div className="end-message" />
      </div>
      <div className="message-box">
        <TextareaAutosize
          className="message-input"
          placeholder="Type message..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          maxRows={2}
        />

        <button type="submit" className="message-submit message-send" onClick={handleSubmit}>
          <Send />
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <ReactMic
            record={record}
            className="sound-wave hidden"
            onStop={onStop}
            onData={onData}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />
          {record ? (
            <button onClick={stopRecording} className="message-submit record-button" type="button">
              <CircleStop />
            </button>
          ) : (
            <button onClick={startRecording} className="message-submit record-button" type="button">
              <Mic />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
