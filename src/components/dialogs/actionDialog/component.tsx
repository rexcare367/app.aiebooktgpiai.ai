import React, { useState } from "react";
import "./actionDialog.css";
import { Trans } from "react-i18next";
import { ActionDialogProps } from "./interface";
import AddTrash from "../../../utils/readUtils/addTrash";

import toast from "react-hot-toast";
// import AddFavorite from "../../../utils/readUtils/addFavorite";
import MoreAction from "../moreAction";
import api from "../../../utils/axios";
import { authService } from "../../../utils/authService";

declare var window: any;

const ActionDialog: React.FC<ActionDialogProps> = (props) => {
  const [isShowExport, setIsShowExport] = useState(false);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [isExceed, setIsExceed] = useState(false);

  const handleDetailBook = () => {
    props.handleDetailDialog(true);
    props.handleReadingBook(props.currentBook);
    props.handleActionDialog(false);
  };

  const handleRestoreBook = () => {
    AddTrash.clear(props.currentBook.key);
    props.handleActionDialog(false);
    toast.success(props.t("Restore successful"));
    props.handleFetchBooks();
  };

  const handleLoveBook = async () => {
    const userData = authService.getUserData();
    console.log('userData', userData)
    const username = userData?.ic_number;
    const { key } = props.currentBook;

    await api
      .post("/api/users/add-favorite", {
        user_id: username,
        book_id: key,
      })
      .then((res) => {
        console.log("res", res);
        toast.success(props.t("Addition successful"));
        props.handleActionDialog(false);
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(props.t("Addition failed"));
      });
  };

  const handleMultiSelect = () => {
    props.handleSelectBook(true);
    props.handleSelectedBooks([props.currentBook.key]);
    props.handleActionDialog(false);
  };

  const handleCancelLoveBook = async () => {
    const userData = authService.getUserData();
    const username = userData?.id || "unknown";
    const { key } = props.currentBook;
    await api
      .post("/api/users/remove-favorite", {
        user_id: username,
        book_id: key,
      })
      .then((res) => {
        toast.success(props.t("Cancellation successful"));
        props.handleActionDialog(false);
        props.loadFavoriteBooks();
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(props.t("Cancellation failed"));
      });
  };

  const handleMoreAction = (isShow: boolean) => {
    setIsShowExport(isShow);
  };
  const moreActionProps = {
    left: props.left,
    top: props.top,
    isShowExport: isShowExport,
    isExceed: isExceed,
    handleMoreAction: handleMoreAction,
  };

  if (props.mode === "trash") {
    return (
      <div
        className="action-dialog-container"
        onMouseLeave={() => {
          props.handleActionDialog(false);
        }}
        onMouseEnter={() => {
          props.handleActionDialog(true);
        }}
        style={{
          left: props.left,
          top: props.top,
        }}
      >
        <div className="action-dialog-actions-container">
          <div
            className="action-dialog-add"
            onClick={() => {
              handleRestoreBook();
            }}
          >
            <span className="icon-clockwise view-icon"></span>
            <span className="action-name">
              <Trans>Restore</Trans>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="action-dialog-container"
        onMouseLeave={() => {
          props.handleActionDialog(false);
        }}
        onMouseEnter={() => {
          props.handleActionDialog(true);
        }}
        style={{ left: props.left, top: props.top }}
      >
        <div className="action-dialog-actions-container">
          <div
            className="action-dialog-add"
            onClick={() => {
              if (props.isFavorite) {
                handleCancelLoveBook();
              } else {
                handleLoveBook();
              }
            }}
          >
            <span className="icon-heart view-icon"></span>
            <p className="action-name">
              {props.isFavorite ? <Trans>Remove from favorite</Trans> : <Trans>Add to favorite</Trans>}
            </p>
          </div>
          <div
            className="action-dialog-add"
            onClick={() => {
              handleMultiSelect();
            }}
          >
            <span className="icon-select view-icon"></span>
            <p className="action-name">
              <Trans>Multiple selection</Trans>
            </p>
          </div>
          {/* <div
            className="action-dialog-delete"
            onClick={() => {
              handleDeleteBook();
            }}
          >
            <span className="icon-trash-line view-icon"></span>
            <p className="action-name">
              <Trans>Delete</Trans>
            </p>
          </div> */}
          {/* <div
            className="action-dialog-edit"
            onClick={() => {
              handleEditBook();
            }}
          >
            <span className="icon-edit-line view-icon"></span>
            <p className="action-name">
              <Trans>Edit</Trans>
            </p>
          </div> */}
          <div
            className="action-dialog-edit"
            onClick={() => {
              handleDetailBook();
            }}
          >
            <span className="icon-idea-line view-icon" style={{ fontSize: "17px" }}></span>
            <p className="action-name" style={{ marginLeft: "12px" }}>
              <Trans>Details</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            onMouseEnter={(event) => {
              setIsShowExport(true);
              const e = event || window.event;
              let x = e.clientX;
              if (x > document.body.clientWidth - 300) {
                setIsExceed(true);
              } else {
                setIsExceed(false);
              }
            }}
            onMouseLeave={(event) => {
              setIsShowExport(false);
              event.stopPropagation();
            }}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <p className="action-name" style={{ marginLeft: "0px" }}>
              <span
                className="icon-more view-icon"
                style={{
                  display: "inline-block",
                  marginRight: "12px",
                  marginLeft: "3px",
                  transform: "rotate(90deg)",
                  fontSize: "12px",
                }}
              ></span>
              <Trans>More actions</Trans>
            </p>

            <span className="icon-dropdown icon-export-all" style={{ left: "95px" }}></span>
          </div>
        </div>
      </div>
      <MoreAction {...moreActionProps} />
    </>
  );
};

export default ActionDialog;
