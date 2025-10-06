import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/header";
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

const Manager: React.FC<ManagerProps> = (props) => {
  const timerRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<ManagerState>({
    totalBooks: parseInt(StorageUtil.getReaderConfig("totalBooks")) || 0,
    favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
    isAuthed: false,
    isError: false,
    isCopied: false,
    isUpdated: false,
    token: "",
  });

  // Handle props changes (equivalent to UNSAFE_componentWillReceiveProps)
  useEffect(() => {
    if (props.books && state.totalBooks !== props.books.length) {
      const newTotalBooks = props.books.length;
      setState(prevState => ({
        ...prevState,
        totalBooks: newTotalBooks,
      }));
      StorageUtil.setReaderConfig("totalBooks", newTotalBooks.toString());
    }
    
    // This logic seems incorrect - commenting out for now as it would never execute
    // if (props.books && props.books.length === 1 && !props.books) {
    //   props.history.push("/manager/home");
    // }
  }, [props.books, props.history, state.totalBooks]);

  // Handle mode changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
    }));
  }, [props.mode]);

  // Initial data fetching (equivalent to UNSAFE_componentWillMount)
  useEffect(() => {
    props.handleFetchBooks();
    props.handleFetchNotes();
    props.handleFetchBookmarks();
    props.handleFetchBookSortCode();
    props.handleFetchNoteSortCode();
    props.handleFetchList();
  }, [
    props.handleFetchBooks,
    props.handleFetchNotes,
    props.handleFetchBookmarks,
    props.handleFetchBookSortCode,
    props.handleFetchNoteSortCode,
    props.handleFetchList
  ]);

  // Component mount effect (equivalent to componentDidMount)
  useEffect(() => {
    props.handleReadingState(false);
  }, [props.handleReadingState]);

  const handleDragBackgroundClick = () => {
    props.handleEditDialog(false);
    props.handleDeleteDialog(false);
    props.handleAddDialog(false);
    props.handleTipDialog(false);
    props.handleDetailDialog(false);
    props.handleLoadingDialog(false);
    props.handleNewDialog(false);
    props.handleBackupDialog(false);
    props.handleSetting(false);
    props.handleFeedbackDialog(false);
  };

  const shouldShowDragBackground = 
    props.isSettingOpen ||
    props.isOpenFeedbackDialog ||
    props.isBackup ||
    props.isShowNew ||
    props.isOpenDeleteDialog ||
    props.isOpenEditDialog ||
    props.isDetailDialog ||
    props.isOpenAddDialog ||
    props.isTipDialog ||
    props.isShowLoading;

  return (
    <div className="manager flex flex-row">
      <Tooltip id="my-tooltip" style={{ zIndex: 25 }} />
      {!props.dragItem && (
        <div
          className="drag-background"
          onClick={handleDragBackgroundClick}
          style={shouldShowDragBackground ? {} : { display: "none" }}
        ></div>
      )}
      <Sidebar />
      <Toaster />
      <div className="flex flex-col flex-1 w-full relative bg-white dark:bg-gray-800">
        <Header />
        {props.isOpenDeleteDialog && <DeleteDialog />}
        {props.isOpenEditDialog && <EditDialog />}
        {props.isOpenAddDialog && <AddDialog />}
        {props.isShowLoading && <LoadingDialog />}
        {props.isSortDisplay && <SortDialog />}
        {props.isAboutOpen && <AboutDialog />}
        {props.isBackup && <BackupDialog />}
        {props.isOpenFeedbackDialog && <FeedbackDialog />}
        {props.isSettingOpen && <SettingDialog />}
        {props.isTipDialog && <TipDialog />}
        {props.isDetailDialog && <DetailDialog />}
        <div className="h-[calc(100vh_-_70px)] bg-gray-main-bg dark:bg-transparent/20 rounded-xl ">
          <div className="m-2 h-full ">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manager;
