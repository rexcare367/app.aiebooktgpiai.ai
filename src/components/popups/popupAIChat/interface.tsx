import BookModel from "../../../models/Book";
import HtmlBook from "../../../models/HtmlBook";
import NoteModel from "../../../models/Note";
export interface PopupAIChatProps {
  currentBook: BookModel;
  notes: NoteModel[];
  color: number;
  noteKey: string;
  chapterDocIndex: number;
  chapter: string;
  htmlBook: HtmlBook;
  handleNoteKey: (key: string) => void;
  handleOpenMenu: (isOpenMenu: boolean) => void;
  handleMenuMode: (menu: string) => void;
  handleFetchNotes: () => void;
  t: (title: string) => string;
}
export interface PopupAIChatState {
  tag: string[];
  text: string;
}
