import React from "react";
import Sidebar from "../../containers/sidebar";
import Header from "../../containers/header";
import DeleteDialog from "../../components/dialogs/deleteDialog";
import EditDialog from "../../components/dialogs/editDialog";
import AddDialog from "../../components/dialogs/addDialog";
import SortDialog from "../../components/dialogs/sortDialog";
import AboutDialog from "../../components/dialogs/aboutDialog";
import BackupDialog from "../../components/dialogs/backupDialog";
import "./manager.css";
import { ManagerProps, ManagerState } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import AddFavorite from "../../utils/readUtils/addFavorite";
import SettingDialog from "../../components/dialogs/settingDialog";
import LoadingDialog from "../../components/dialogs/loadingDialog";
import TipDialog from "../../components/dialogs/TipDialog";
import { Toaster } from "react-hot-toast";
import DetailDialog from "../../components/dialogs/detailDialog";
import FeedbackDialog from "../../components/dialogs/feedbackDialog";
import { Tooltip } from "react-tooltip";
class Manager extends React.Component<ManagerProps, ManagerState> {
  timer!: NodeJS.Timeout;
  constructor(props: ManagerProps) {
    super(props);
    this.state = {
      totalBooks: parseInt(StorageUtil.getReaderConfig("totalBooks")) || 0,
      favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
      isAuthed: false,
      isError: false,
      isCopied: false,
      isUpdated: false,
      token: "",
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: ManagerProps) {
    if (nextProps.books && this.state.totalBooks !== nextProps.books.length) {
      this.setState(
        {
          totalBooks: nextProps.books.length,
        },
        () => {
          StorageUtil.setReaderConfig("totalBooks", this.state.totalBooks.toString());
        }
      );
    }
    if (nextProps.books && nextProps.books.length === 1 && !this.props.books) {
      this.props.history.push("/manager/home");
    }
    if (this.props.mode !== nextProps.mode) {
      this.setState({
        favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
      });
    }
  }
  UNSAFE_componentWillMount() {
    this.props.handleFetchBooks();
    this.props.handleFetchNotes();
    this.props.handleFetchBookmarks();
    this.props.handleFetchBookSortCode();
    this.props.handleFetchNoteSortCode();
    this.props.handleFetchList();
  }
  componentDidMount() {
    this.props.handleReadingState(false);
  }
  render() {
    return (
      <div className="manager flex flex-row">
        <Tooltip id="my-tooltip" style={{ zIndex: 25 }} />
        {!this.props.dragItem && (
          <div
            className="drag-background"
            onClick={() => {
              this.props.handleEditDialog(false);
              this.props.handleDeleteDialog(false);
              this.props.handleAddDialog(false);
              this.props.handleTipDialog(false);
              this.props.handleDetailDialog(false);
              this.props.handleLoadingDialog(false);
              this.props.handleNewDialog(false);
              this.props.handleBackupDialog(false);
              this.props.handleSetting(false);
              this.props.handleFeedbackDialog(false);
            }}
            style={
              this.props.isSettingOpen ||
              this.props.isOpenFeedbackDialog ||
              this.props.isBackup ||
              this.props.isShowNew ||
              this.props.isOpenDeleteDialog ||
              this.props.isOpenEditDialog ||
              this.props.isDetailDialog ||
              this.props.isOpenAddDialog ||
              this.props.isTipDialog ||
              this.props.isShowLoading
                ? {}
                : {
                    display: "none",
                  }
            }
          ></div>
        )}
        <Sidebar />
        <Toaster />
        <div className="flex flex-col flex-1 w-full relative md:pl-1 bg-gray-main-bg">
          <Header />
          {this.props.isOpenDeleteDialog && <DeleteDialog />}
          {this.props.isOpenEditDialog && <EditDialog />}
          {this.props.isOpenAddDialog && <AddDialog />}
          {this.props.isShowLoading && <LoadingDialog />}
          {this.props.isSortDisplay && <SortDialog />}
          {this.props.isAboutOpen && <AboutDialog />}
          {this.props.isBackup && <BackupDialog />}
          {this.props.isOpenFeedbackDialog && <FeedbackDialog />}
          {this.props.isSettingOpen && <SettingDialog />}
          {this.props.isTipDialog && <TipDialog />}
          {this.props.isDetailDialog && <DetailDialog />}
          {this.props.children}
        </div>
      </div>
    );
  }
}
export default Manager;
