import { RouteComponentProps } from "react-router";
import BookModel from "../../../models/Book";
import NoteModel from "../../../models/Note";

export interface ChatbotDialogProps extends RouteComponentProps<any> {
  isSettingOpen: boolean;
  isAboutOpen: boolean;
  isNewWarning: boolean;
  books: BookModel[];
  notes: NoteModel[];
  deletedBooks: BookModel[];
  handleSetting: (isSettingOpen: boolean) => void;
  handleAbout: (isAboutOpen: boolean) => void;
  t: (title: string) => string;
}

export interface ChatbotDialogState {
  isShow: boolean;
  isLoading: boolean;
  isChat: boolean;
  messages: any[];
  input: string;
}

export interface ChatbotWidgetProps {
  customStyle?: any;
  defaultInput?: string;
  onClose?: () => void;
  onMessage?: (message: string, messages: any[]) => void;
  handleShow: () => void;
}
