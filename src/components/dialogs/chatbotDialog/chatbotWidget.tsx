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
import { CircleXIcon, BotIcon } from "lucide-react";
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 12L3 20L6.5625 12L3 4L22 12Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6.5 12L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
              <svg
                fill="#00ffff"
                height="24px"
                width="24px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                stroke="#ff00ff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <g>
                      <g>
                        <path d="M256,0C114.842,0,0.002,114.84,0.002,256.001C0.002,397.159,114.841,512,255.999,512s255.999-114.841,255.999-255.999 C511.999,114.84,397.158,0,256,0z M256,490.665c-129.394,0-234.662-105.271-234.662-234.665 C21.336,126.605,126.606,21.335,256,21.335c129.395,0,234.665,105.271,234.665,234.666S385.394,490.665,256,490.665z"></path>
                        <path d="M270.394,85.944c5.875,0.513,11.033-3.857,11.531-9.728c0.497-5.87-3.858-11.033-9.729-11.53 C266.826,64.231,261.377,64,256,64C150.13,64,63.999,150.133,63.999,256.005c0,5.889,4.777,10.667,10.667,10.667 c5.892,0,10.667-4.778,10.667-10.667c0-94.107,76.561-170.67,170.666-170.67C260.777,85.335,265.621,85.54,270.394,85.944z"></path>
                        <path d="M437.332,245.337c-5.892,0-10.667,4.776-10.667,10.667c0,94.105-76.56,170.664-170.664,170.664 c-4.779,0-9.623-0.206-14.396-0.61c-5.879-0.494-11.033,3.858-11.531,9.728c-0.497,5.871,3.858,11.034,9.729,11.53 c5.37,0.457,10.82,0.688,16.198,0.688c105.868,0,191.999-86.131,191.999-191.999 C447.999,250.112,443.223,245.337,437.332,245.337z"></path>
                        <path d="M299.413,90.951l0.691,0.186c0.946,0.26,1.896,0.384,2.831,0.384c4.684,0,8.98-3.11,10.28-7.845 c1.562-5.68-1.779-11.552-7.459-13.112l-0.859-0.231c-5.69-1.505-11.536,1.873-13.051,7.566 C290.332,83.591,293.719,89.435,299.413,90.951z"></path>
                        <path d="M212.585,421.055l-0.691-0.186c-5.682-1.565-11.552,1.779-13.111,7.459c-1.562,5.681,1.779,11.553,7.459,13.113 l0.859,0.232c0.918,0.244,1.842,0.361,2.75,0.361c4.716,0,9.031-3.152,10.3-7.928 C221.665,428.413,218.278,422.568,212.585,421.055z"></path>
                        <path d="M312.844,351.516c21.321,0,38.667-17.347,38.667-38.667V199.157c0-21.322-17.346-38.668-38.667-38.668H199.154 c-21.321,0-38.667,17.345-38.667,38.668v113.691c0,21.32,17.346,38.667,38.667,38.667H312.844z M181.822,312.848V199.157 c0-9.557,7.775-17.332,17.332-17.332h113.689c9.557,0,17.332,7.776,17.332,17.332v113.691c0,9.557-7.776,17.332-17.332,17.332 H199.154C189.597,330.181,181.822,322.405,181.822,312.848z"></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </button>
          ) : (
            <button onClick={startRecording} className="message-submit record-button" type="button">
              <svg
                className="record-button-icon"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 47.96 47.96"
                stroke="#ff00ff"
                strokeWidth="0.00047964000000000004"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="#CCCCCC"
                  strokeWidth="1.6307760000000002"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <g>
                      <path d="M23.982,35.268c5.531,0,10.033-4.635,10.033-10.332V10.333C34.015,4.635,29.513,0,23.982,0 c-5.532,0-10.032,4.635-10.032,10.333v14.604C13.951,30.633,18.451,35.268,23.982,35.268z M29.22,24.938 c0,2.974-2.35,5.395-5.238,5.395s-5.238-2.42-5.238-5.395V10.333c0-2.974,2.35-5.395,5.238-5.395s5.238,2.42,5.238,5.395V24.938z"></path>
                      <path d="M40.125,29.994c0-1.361-1.222-2.469-2.72-2.469c-1.5,0-2.721,1.107-2.721,2.469c0,4.042-3.621,7.329-8.074,7.329h-5.257 c-4.453,0-8.074-3.287-8.074-7.329c0-1.361-1.221-2.469-2.721-2.469c-1.499,0-2.719,1.107-2.719,2.469 c0,6.736,6.014,12.221,13.424,12.266v0.766h-5.944c-1.499,0-2.72,1.107-2.72,2.47s1.221,2.47,2.72,2.47h17.325 c1.5,0,2.721-1.107,2.721-2.47s-1.221-2.47-2.721-2.47h-5.942V42.26C34.111,42.215,40.125,36.73,40.125,29.994z"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
