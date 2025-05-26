import React, { useState, useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import "./ebookChatbot.css";
import TextareaAutosize from "react-textarea-autosize";
import moment from "moment";
import markdownit from "markdown-it";
import { SyncLoader } from "react-spinners";
import { ReactMic } from "react-mic";
import ReactAudioPlayer from "react-audio-player";
import { ebookChatbotWidgetProps, MessageContent } from "./interface";
import OpenAI from "openai";
import { DynamoDB } from "aws-sdk";

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_READER_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  },
});

type IMessage = {
  type: string;
  variant: string;
  text: string;
  attachment: string;
  timestamp: string;
};

export default function EbookChatbotWidget({
  customStyle,
  defaultInput = "",
  currentTitle = "",
}: ebookChatbotWidgetProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState(false);
  const [isWaitingAIVoice, setIsWaitingAIVoice] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([
    {
      type: "bot",
      variant: "text",
      text: "Hello! I'm your AI assistant for this book. How can I help you?",
      attachment: "",
      timestamp: moment().format("hh:mm"),
    },
  ]);
  const [input, setInput] = useState(defaultInput);

  // Fetch assistant ID from DynamoDB when component mounts
  useEffect(() => {
    const fetchAssistantId = async () => {
      if (!currentTitle) {
        console.error("No currentTitle provided");
        return;
      }

      try {
        // Replace underscores with spaces in the file key
        const normalizedTitle = currentTitle.replace(/_/g, " ");
        const compressedFileKey = `compressed/${normalizedTitle}`;
        console.log("Fetching assistant ID for:", compressedFileKey);

        const idTagParams = {
          TableName: "id_and_tag",
          KeyConditionExpression: "file_key = :fileKey",
          ExpressionAttributeValues: {
            ":fileKey": compressedFileKey,
          },
        };

        const idTagResult = await dynamoDB.query(idTagParams).promise();

        if (idTagResult.Items && idTagResult.Items.length > 0) {
          const assistantId = idTagResult.Items[0].assistant_id;
          console.log("Found assistant ID:", assistantId);

          if (!assistantId) {
            console.error("Assistant ID is null or undefined for:", compressedFileKey);
            return;
          }

          setAssistantId(assistantId);

          // Create a new thread for this chat session
          const thread = await openai.beta.threads.create();
          console.log("Created new thread:", thread.id);
          setThreadId(thread.id);
        } else {
          console.error("No assistant ID found in id_and_tag for:", compressedFileKey);
        }
      } catch (error) {
        console.error("Error fetching assistant ID:", error);
      }
    };

    fetchAssistantId();
  }, [currentTitle]);

  const sendQuestion = async () => {
    if (input.trim() === "") return;

    if (!assistantId) {
      console.error("No assistant ID available");
      return;
    }

    if (!threadId) {
      console.error("No thread ID available");
      return;
    }

    setIsLoading(true);

    const newMessage: IMessage = {
      type: "user",
      variant: "text",
      text: input,
      attachment: "",
      timestamp: moment().format("hh:mm"),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      console.log("Sending message with:", { threadId, assistantId, input });

      // Add the user's message to the thread
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: input,
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Poll for completion
      const checkRunCompletion = async () => {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        console.log("Run status:", runStatus.status);

        if (runStatus.status === "completed") {
          const messageList = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messageList.data.filter((msg) => msg.role === "assistant")[0];

          if (lastMessage && lastMessage.content.length > 0) {
            const content = lastMessage.content[0] as MessageContent;

            if (content.type === "text") {
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  variant: "text",
                  text: content.text.value,
                  attachment: "",
                  timestamp: moment().format("hh:mm"),
                },
              ]);
            }
          }

          setIsLoading(false);
          return;
        }

        if (runStatus.status === "failed" || runStatus.status === "cancelled") {
          console.error("Assistant run failed:", runStatus);
          setIsLoading(false);
          return;
        }

        setTimeout(checkRunCompletion, 1000);
      };

      checkRunCompletion();
    } catch (error) {
      console.error("Error in chat:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput(input + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [messages]);

  // Audio handling functions
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

  const onStop = async (recordedBlob: any) => {
    const file = new File([recordedBlob.blob], "recording.wav", {
      type: "audio/wav",
    });
    const audioURL = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        variant: "audio",
        text: "Voice message",
        attachment: audioURL,
        timestamp: moment().format("hh:mm"),
      },
    ]);

    try {
      // Transcribe the audio using OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
      });

      // Send the transcribed text to the assistant
      setInput(transcription.text);
      await sendQuestion();
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsWaitingAIVoice(false);
    }
  };

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <Trans>AI Assistant</Trans>
      </div>
      <div className="chatbot-messages" ref={messagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type === "user" ? "message-personal" : "message-bot"}`}>
            <figure className="avatar">
              {msg.type !== "user" ? (
                <img src="assets/bot_round.png" alt="Bot Avatar" className="bot-avatar" />
              ) : (
                <svg id="user_avatar_face" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" style={{ fill: 'var(--active-theme-color)' }}/>
                </svg>
              )}
            </figure>

            {msg.variant === "text" ? (
              <div
                className="message-box-content"
                style={{ cursor: "text", userSelect: "text", WebkitUserSelect: "text" }}
                dangerouslySetInnerHTML={{ __html: md.render(msg.text) }}
              />
            ) : (
              <ReactAudioPlayer style={{ height: "40px", width: "260px" }} src={msg.attachment} autoPlay controls />
            )}
          </div>
        ))}

        {(isLoading || isWaitingAIVoice) && (
          <div className="message new">
            <figure className="avatar">
              <img src="assets/bot_round.png" alt="Bot Avatar" className="bot-avatar" />
            </figure>
            <SyncLoader size={6} color="grey" loading={true} speedMultiplier={0.7} />
          </div>
        )}

        <div className="end-message" />
      </div>

      <div className="message-box">
        <TextareaAutosize
          className="message-input"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxRows={2}
        />

        <button type="submit" className="message-submit message-send" onClick={sendQuestion}>
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
            className="hidden sound-wave"
            onStop={onStop}
            onData={onData}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />

          {/* {record ? (
            <button onClick={stopRecording} className="message-submit record-button" type="button">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button onClick={startRecording} className="message-submit record-button" type="button">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 19V12M12 12V5M12 12H19M12 12H5M12 12H19M12 12H5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}
