// src/containers/sidebar/index.tsx
import {
  handleMode,
  handleSearch,
  handleSortDisplay,
  handleCollapse,
  handleSelectBook,
  handleShelfIndex,
  handleShelf,
  handleSearchResults,
  handleSearchKeyword,
} from "../../store/actions";
import { connect } from "react-redux";
import { stateType } from "../../store";
import { withTranslation } from "react-i18next";
import Sidebar from "./component";

const mapStateToProps = (state: stateType) => {
  return {
    mode: state.sidebar.mode,
    isCollapsed: state.sidebar.isCollapsed,
    shelfIndex: state.sidebar.shelfIndex,
    shelf: state.sidebar.shelf,
  };
};
const actionCreator = {
  handleMode,
  handleSearch,
  handleSortDisplay,
  handleCollapse,
  handleSelectBook,
  handleShelfIndex,
  handleShelf,
  handleSearchResults,
  handleSearchKeyword,
};

export default connect(mapStateToProps, actionCreator)(withTranslation()(Sidebar as any) as any);
