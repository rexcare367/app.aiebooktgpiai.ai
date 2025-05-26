import BookModel from "../../models/Book";
import { RouteComponentProps } from "react-router";

export interface BookCardProps extends RouteComponentProps<any> {
  book: any;
  currentBook: BookModel;
  isOpenActionDialog: boolean;
  isSelectBook: boolean;
  isSelected: boolean;
  dragItem: string;
  isFavorite: boolean;
  selectedBooks: string[];
  mode: string;
  handleSelectBook: (isSelectBook: boolean) => void;
  handleReadingBook: (book: BookModel) => void;
  handleActionDialog: (isShowActionDialog: boolean) => void;
  t: (title: string) => string;
  handleDragItem: (key: string) => void;
  handleSelectedBooks: (selectedBooks: string[]) => void;
  handleDeleteDialog: (isShow: boolean) => void;
  loadContentBook: (book: BookModel) => void;
  loadBookList: (book: BookModel) => void;
  loadFavoriteBooks: (book: BookModel) => void;
}
export interface BookCardState {
  isFavorite: boolean;
  isHover: boolean;
  left: number;
  top: number;
  direction: string;
}
