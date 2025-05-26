import { RouteComponentProps } from "react-router";
import BookModel from "../../../models/Book";
import NoteModel from "../../../models/Note";

export interface AboutDialogProps extends RouteComponentProps<any> {
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
export interface AboutDialogState {
  isShow: boolean;
  user: string;
}
