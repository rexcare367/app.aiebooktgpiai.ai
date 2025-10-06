//src/components/bookCardItem/component.tsx
import React, { useState, useEffect, useCallback } from "react";
import RecentBooks from "../../utils/readUtils/recordRecent";
import { BookCardProps } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { withRouter } from "react-router-dom";
import { isElectron } from "react-device-detect";
import BookUtil from "../../utils/fileUtils/bookUtil";

declare var window: any;

interface FavoriteConfirmModalProps {
  isOpen: boolean;
  isFavorite: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FavoriteConfirmModal: React.FC<FavoriteConfirmModalProps> = ({
  isOpen,
  isFavorite,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isFavorite ? "Remove from Favorites?" : "Add to Favorites?"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isFavorite
              ? "This book will be removed from your favorites list."
              : "This book will be added to your favorites list."}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                isFavorite
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              {isFavorite ? "Remove" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookCardItem: React.FC<BookCardProps> = (props) => {
  const [direction, setDirection] = useState("horizontal");
  const [isHover, setIsHover] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    let filePath = "";
    //open book when app start
    if (isElectron) {
      const { ipcRenderer } = window.require("electron");
      filePath = ipcRenderer.sendSync("get-file-data");
    }

    if (
      StorageUtil.getReaderConfig("isOpenBook") === "yes" &&
      RecentBooks.getAllRecent()[0] === props.book.file_key &&
      (!props.currentBook || !props.currentBook.file_key) &&
      !filePath
    ) {
      props.handleReadingBook(props.book);
      BookUtil.RedirectBook(props.book, props.t, props.history);
    }
  }, [props.book.file_key, props.currentBook?.file_key, props.t, props.history, props.handleReadingBook]);


  const handleJump = useCallback(async () => {
    console.log("start load");
    await props.loadContentBook({
      ...props.book,
      source_url: props.book.url,
      name: props.book.title,
    });
    console.log("end load");

    await RecentBooks.setRecent(props.book.file_key);
    props.handleReadingBook(props.book);
    BookUtil.RedirectBook(props.book, props.t, props.history);
  }, [props.book, props.loadContentBook, props.handleReadingBook, props.t, props.history]);

  const handleFavoriteClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConfirmModal(true);
  }, []);

  const handleConfirmFavorite = useCallback(() => {
    props.onToggleFavorite(props.book);
    setShowConfirmModal(false);
  }, [props.onToggleFavorite, props.book]);

  const handleCancelFavorite = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleImageLoad = useCallback((res: any) => {
    if (res.target.naturalHeight / res.target.naturalWidth > 137 / 105) {
      setDirection("horizontal");
    } else {
      setDirection("vertical");
    }
  }, []);

  return (
    <>
      <div className="w-52 h-fit m-2 float-left relative col-span-1 animate-fade-in">
        <div
          className={`w-full p-5 opacity-100 cursor-pointer flex justify-center relative rounded-sm transition-all duration-300 ${
            StorageUtil.getReaderConfig("isDisableCrop") === "yes"
              ? "h-[308px] items-end bg-transparent shadow-none"
              : "h-[278px] items-center overflow-hidden hover:shadow-lg"
          }`}
          onClick={handleJump}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <img
            data-src={props.book.thumbnail}
            alt=""
            className={`lazy-image rounded-sm transition-transform duration-300 ${isHover ? 'scale-105' : ''}`}
            style={
              direction === "horizontal" || StorageUtil.getReaderConfig("isDisableCrop") === "yes"
                ? { width: "100%" }
                : { height: "100%" }
            }
            onLoad={handleImageLoad}
          />
          
          {/* Heart Icon */}
          <div
            className="absolute top-2 right-2 z-10"
            onClick={handleFavoriteClick}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 backdrop-blur-sm">
              {props.isFavorite ? (
                <svg
                  className="w-6 h-6 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition-colors cursor-pointer"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        <p className="w-4/5 mx-auto mt-3 h-[31px] text-xs leading-[15px] opacity-100 text-left overflow-hidden line-clamp-2 relative text-gray-800 dark:text-gray-200">
          {props.book.name}
        </p>
      </div>

      <FavoriteConfirmModal
        isOpen={showConfirmModal}
        isFavorite={props.isFavorite}
        onConfirm={handleConfirmFavorite}
        onCancel={handleCancelFavorite}
      />
    </>
  );
};

export default withRouter(BookCardItem as any);
