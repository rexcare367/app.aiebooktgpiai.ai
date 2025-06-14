import { connect } from "react-redux";
import {
  handleFetchBooks,
  handleFetchBookSortCode,
  handleFetchNoteSortCode,
  handleFetchList,
  handleTipDialog,
  handleDetailDialog,
  handleLoadingDialog,
  handleNewDialog,
  handleFeedbackDialog,
  handleSetting,
  handleBackupDialog,
  handleFetchNotes,
  handleFetchBookmarks,
  handleEditDialog,
  handleDeleteDialog,
  handleAddDialog,
  handleReadingState,
} from "../../store/actions";
import { withTranslation } from "react-i18next";

import "./manager.css";
import { stateType } from "../../store";
import Manager from "./component";
import { withRouter } from "react-router-dom";

const mapStateToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    notes: state.reader.notes,
    digests: state.reader.digests,
    bookmarks: state.reader.bookmarks,
    isReading: state.book.isReading,
    mode: state.sidebar.mode,
    dragItem: state.book.dragItem,
    shelfIndex: state.sidebar.shelfIndex,
    isOpenDeleteDialog: state.book.isOpenDeleteDialog,
    isOpenEditDialog: state.book.isOpenEditDialog,
    isOpenAddDialog: state.book.isOpenAddDialog,
    isShowLoading: state.manager.isShowLoading,
    isSortDisplay: state.manager.isSortDisplay,
    isAboutOpen: state.manager.isAboutOpen,
    isBackup: state.backupPage.isBackup,
    isOpenFeedbackDialog: state.manager.isOpenFeedbackDialog,
    isSettingOpen: state.manager.isSettingOpen,
    isTipDialog: state.manager.isTipDialog,
    isDetailDialog: state.manager.isDetailDialog,
  };
};

const actionCreator = {
  handleFetchBooks,
  handleFetchNotes,
  handleSetting,
  handleFetchBookmarks,
  handleFetchBookSortCode,
  handleFetchNoteSortCode,
  handleFetchList,
  handleEditDialog,
  handleDeleteDialog,
  handleAddDialog,
  handleFeedbackDialog,
  handleTipDialog,
  handleDetailDialog,
  handleLoadingDialog,
  handleNewDialog,
  handleBackupDialog,
  handleReadingState,
};

export default connect(mapStateToProps, actionCreator)(withTranslation()(withRouter(Manager as any) as any) as any);
