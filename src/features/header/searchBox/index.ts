import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { handleSearchResults, handleSearch, handleSearchKeyword } from "../../../store/actions";
import { stateType } from "../../../store";
import SearchBox from "./SearchBox";

const mapStateToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    notes: state.reader.notes,
    htmlBook: state.reader.htmlBook,
    digests: state.reader.digests,
    isSearch: state.manager.isSearch,
    isReading: state.book.isReading,
    currentBook: state.book.currentBook,
    tabMode: state.sidebar.mode,
    shelfIndex: state.sidebar.shelfIndex,
    keyword: state.manager.keyword
  };
};

const actionCreator = {
  handleSearchResults,
  handleSearch,
  handleSearchKeyword
};

export default connect(
  mapStateToProps,
  actionCreator
)(withTranslation()(SearchBox as any) as any);

export { default as SearchBox } from "./SearchBox";
export type { SearchBoxProps } from "./types";
