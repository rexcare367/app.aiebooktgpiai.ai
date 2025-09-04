import { connect } from "react-redux";
import {
  handleFetchList,
  handleFetchBooks,
  handleMode,
  handleShelfIndex,
  handleDeleteDialog,
  handleReadingBook,
  handleLoadingBook
} from "../../store/actions";
import { stateType } from "../../store";
import { withTranslation } from "react-i18next";
import BookList from "./component";

const mappropsToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    isLoadingBook: state.manager.isLoadingBook,
    mode: state.sidebar.mode,
    bookmarks: state.reader.bookmarks,
    notes: state.reader.notes,
    selectedBooks: state.manager.selectedBooks,
    deletedBooks: state.manager.deletedBooks,
    shelfIndex: state.sidebar.shelfIndex,
    isCollapsed: state.sidebar.isCollapsed,
    searchResults: state.manager.searchResults,
    isSearch: state.manager.isSearch,
    isSelectBook: state.manager.isSelectBook,
    isBookSort: state.manager.isBookSort,
    viewMode: state.manager.viewMode,
    bookSortCode: state.manager.bookSortCode,
    noteSortCode: state.manager.noteSortCode,
    keyword: state.manager.keyword,
  };
};
const actionCreator = {
  handleFetchList,
  handleMode,
  handleShelfIndex,
  handleFetchBooks,
  handleReadingBook,
  handleDeleteDialog,
  handleLoadingBook
};
export default connect(
  mappropsToProps,
  actionCreator
)(withTranslation()(BookList as any) as any);
