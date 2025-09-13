//src/components/dialogs/chatbotDialog/chatbotWidget.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import moment from "moment";
import markdownit from "markdown-it";
import { SyncLoader } from "react-spinners";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ReactMic } from "react-mic";
import ReactAudioPlayer from "react-audio-player";
import { ChatbotWidgetProps } from "./interface";
import { CircleXIcon, BotIcon, Send, Mic, CircleStop, Trash2 } from "lucide-react";
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
  // Load chat history from localStorage or initialize with welcome message
  const [messages, setMessages] = useState<IMessage[]>(() => {
    const savedMessages = localStorage.getItem('chatbot-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Ensure we have at least one message and it's a valid array
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      } catch (error) {
        console.error('Error parsing saved chat messages:', error);
      }
    }
    return [
      {
        type: "bot",
        variant: "text",
        text: "Hello, I am AI assistant! How can I assist you today?",
        attachment: "",
        timestamp: moment().format("hh:mm"),
      },
    ];
  });
  const [input, setInput] = useState("");

  // Function to clear chat history
  const clearChatHistory = () => {
    const welcomeMessage: IMessage = {
      type: "bot",
      variant: "text",
      text: "Hello, I am AI assistant! How can I assist you today?",
      attachment: "",
      timestamp: moment().format("hh:mm"),
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('chatbot-messages');
  };

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

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatbot-messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo(0, 10000000000);
    }
  }, [messages]);

  useEffect(() => {
    if (!isChat) return;
    setInput("");
    let _messages = messages.slice();

    console.log('==============', _messages)

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

    console.log('newMessage', newMessage)

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    if (onMessage) {
      await onMessage(input, [...messages, newMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-20 right-6 w-[calc(100vw-3rem)] sm:w-[28rem] lg:w-[32rem] h-[calc(100vh-8rem)] sm:h-[36rem] lg:h-[40rem] max-h-[90vh] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-2xl flex flex-col z-chatbot animate-slide-in-right" style={customStyle?.chat}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">
            <Trans>AI Assistant</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChatHistory}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={handleShow}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <CircleXIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        style={messageStyles} 
        ref={messagesRef}
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
              msg.type === "user" 
                ? "bg-gradient-to-br from-primary-500 to-primary-600" 
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}>
              {msg.type !== "user" ? (
                <img src="assets/bot_round.png" alt="Bot Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>

            {/* Message Content */}
            <div className={`max-w-[75%] ${msg.type === "user" ? "flex flex-col items-end" : ""}`}>
              {msg.variant === "text" ? (
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200/50 dark:border-gray-700/50"
                  }`}
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <ReactAudioPlayer 
                    style={{ height: "40px", width: "260px" }} 
                    src={msg.attachment} 
                    autoPlay 
                    controls 
                  />
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {((isChat && isLoading) || isWaitingAIVoice) && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <img src="assets/bot_round.png" alt="Bot Avatar" className="w-6 h-6 rounded-full object-cover" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <SyncLoader size={4} color="rgba(1, 121, 202, 1)" loading={isLoading} speedMultiplier={0.7} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-end gap-2 items-center">
          <div className="flex-1 relative">
            <TextareaAutosize
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none shadow-sm transition-all duration-200"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxRows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Voice Recording Button - Commented out for now */}
            {/* <div className="relative">
              <ReactMic
                record={record}
                className="hidden"
                onStop={onStop}
                onData={onData}
                strokeColor="#000000"
                backgroundColor="#FF4081"
              />
              <button
                onClick={record ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                  record 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300"
                }`}
                type="button"
              >
                {record ? (
                  <CircleStop className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div> */}

            {/* Send Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
