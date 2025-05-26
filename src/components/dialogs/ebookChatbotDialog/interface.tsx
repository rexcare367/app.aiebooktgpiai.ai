// interface.ts
import { RouteComponentProps } from "react-router-dom";

export interface ebookChatbotDialogProps extends RouteComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultInput?: string;
  currentTitle?: string;
}

export interface ebookChatbotWidgetProps {
  customStyle?: {
    chat?: React.CSSProperties;
    "message-header"?: React.CSSProperties;
    messages?: React.CSSProperties;
  };
  defaultInput?: string;
  currentTitle?: string;
}

// Helper type for OpenAI message content
type MessageContentText = {
  type: 'text';
  text: {
    value: string;
    annotations: Array<any>;
  };
}

type MessageContentImage = {
  type: 'image_file';
  image_file: {
    file_id: string;
  };
}

export type MessageContent = MessageContentText | MessageContentImage;