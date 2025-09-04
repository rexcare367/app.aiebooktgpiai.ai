import BookModel from "../../models/Book";
import { RouteComponentProps } from "react-router";

export interface BookCardProps extends RouteComponentProps<any> {
  book: any;
  currentBook?: BookModel;
  isFavorite: boolean;
  t: (title: string) => string;
  handleReadingBook: (book: BookModel) => void;
  loadContentBook: (book: BookModel) => void;
  onToggleFavorite: (book: any) => void;
}
