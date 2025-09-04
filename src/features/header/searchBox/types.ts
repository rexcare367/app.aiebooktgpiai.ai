import BookModel from "../../../models/Book";
import NoteModel from "../../../models/Note";
import htmlBookModel from "../../../models/HtmlBook";

export interface SearchBoxProps {
  books: BookModel[];
  isSearch: boolean;
  isNavSearch: boolean;
  isReading: boolean;
  mode: string;
  tabMode: string;
  notes: NoteModel[];
  digests: NoteModel[];
  width: string;
  height: string;
  currentBook: any;
  htmlBook: htmlBookModel;
  shelfIndex: number;
  handleSearchResults: (results: number[]) => void;
  handleSearch: (isSearch: boolean) => void;
  handleSearchKeyword: (keyword: string) => void;
  handleNavSearchState: (state: string) => void;
  handleSearchList: (searchList: any) => void;
  t: (text: string) => string;
  keyword?: string;
}

export interface SearchBoxState {
  inputValue: string;
  isFocused: boolean;
  isComposing: boolean;
}

export interface SearchBoxHandlers {
  handleSearch: (value: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCancel: () => void;
  handleFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
}
