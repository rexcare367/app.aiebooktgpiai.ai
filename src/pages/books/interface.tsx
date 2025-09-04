import BookModel from "../../models/Book";
import NoteModel from "../../models/Note";
import BookmarkModel from "../../models/Bookmark";
import { RouteComponentProps } from "react-router";
export interface BookListProps extends RouteComponentProps<any> {
  books: BookModel[];
  isLoadingBook: boolean;
  mode: string;
  shelfIndex: number;
  searchResults: number[];
  isSearch: boolean;
  isCollapsed: boolean;
  isBookSort: boolean;
  isSelectBook: boolean;
  viewMode: string;
  selectedBooks: string[];
  deletedBooks: BookModel[];
  bookmarks: BookmarkModel[];
  notes: NoteModel[];
  keyword: string;
  bookSortCode: { sort: number; order: number };
  noteSortCode: { sort: number; order: number };
  handleFetchList: () => void;
  handleAddDialog: (isShow: boolean) => void;
  handleMode: (mode: string) => void;
  handleFetchBooks: () => void;
  handleShelfIndex: (index: number) => void;
  handleDeleteDialog: (isShow: boolean) => void;
  handleReadingBook: (book: BookModel) => void;
  handleLoadingBook: (isLoadingBook: boolean) => void;
  t: (title: string) => string;
  history: any;
}
export interface BookListState {
  favoriteBooks: string[];
  isHideShelfBook: boolean;
  isOpenDelete: boolean;
  isRefreshing: boolean;
  isOpenFile: boolean;
  books: BookModel[];
  width: number;
  totalItems: number;
  isShelfDropdownOpen: boolean;
  isLanguageDropdownOpen: boolean;
}
