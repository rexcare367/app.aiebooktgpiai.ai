import React from "react";
import "./actionDialog.css";
import { Trans } from "react-i18next";
import { ActionDialogProps, ActionDialogState } from "./interface";
import AddTrash from "../../../utils/readUtils/addTrash";

import toast from "react-hot-toast";
// import AddFavorite from "../../../utils/readUtils/addFavorite";
import MoreAction from "../moreAction";
import api from "../../../utils/axios";
import { getCurrentUser } from "@aws-amplify/auth";

declare var window: any;
class ActionDialog extends React.Component<ActionDialogProps, ActionDialogState> {
  constructor(props: ActionDialogProps) {
    super(props);
    this.state = {
      isShowExport: false,
      isShowDetail: false,
      isExceed: false,
    };
  }
  handleDeleteBook = () => {
    this.props.handleReadingBook(this.props.currentBook);
    this.props.handleDeleteDialog(true);
    this.props.handleActionDialog(false);
  };
  handleEditBook = () => {
    this.props.handleEditDialog(true);
    this.props.handleReadingBook(this.props.currentBook);
    this.props.handleActionDialog(false);
  };
  handleDetailBook = () => {
    this.props.handleDetailDialog(true);
    this.props.handleReadingBook(this.props.currentBook);
    this.props.handleActionDialog(false);
  };
  handleAddShelf = () => {
    this.props.handleAddDialog(true);
    this.props.handleReadingBook(this.props.currentBook);
    this.props.handleActionDialog(false);
  };
  handleRestoreBook = () => {
    AddTrash.clear(this.props.currentBook.key);
    this.props.handleActionDialog(false);
    toast.success(this.props.t("Restore successful"));
    this.props.handleFetchBooks();
  };
  handleLoveBook = async () => {
    const { username } = await getCurrentUser();
    const { key } = this.props.currentBook;

    await api
      .post("/api/ebooks/add-favorite", {
        user_id: username,
        book_id: key,
      })
      .then((res) => {
        console.log("res", res);
        toast.success(this.props.t("Addition successful"));
        this.props.handleActionDialog(false);
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(this.props.t("Addition failed"));
      });
  };
  handleMultiSelect = () => {
    this.props.handleSelectBook(true);
    this.props.handleSelectedBooks([this.props.currentBook.key]);
    this.props.handleActionDialog(false);
  };
  handleCancelLoveBook = async () => {
    const { username } = await getCurrentUser();
    const { key } = this.props.currentBook;
    await api
      .post("/api/ebooks/remove-favorite", {
        user_id: username,
        book_id: key,
      })
      .then((res) => {
        toast.success(this.props.t("Cancellation successful"));
        this.props.handleActionDialog(false);
        this.props.loadFavoriteBooks();
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(this.props.t("Cancellation failed"));
      });
  };
  handleMoreAction = (isShow: boolean) => {
    this.setState({ isShowExport: isShow });
  };
  render() {
    const moreActionProps = {
      left: this.props.left,
      top: this.props.top,
      isShowExport: this.state.isShowExport,
      isExceed: this.state.isExceed,
      handleMoreAction: this.handleMoreAction,
    };
    if (this.props.mode === "trash") {
      return (
        <div
          className="action-dialog-container"
          onMouseLeave={() => {
            this.props.handleActionDialog(false);
          }}
          onMouseEnter={() => {
            this.props.handleActionDialog(true);
          }}
          style={{
            left: this.props.left,
            top: this.props.top,
          }}
        >
          <div className="action-dialog-actions-container">
            <div
              className="action-dialog-add"
              onClick={() => {
                this.handleRestoreBook();
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
            this.props.handleActionDialog(false);
          }}
          onMouseEnter={() => {
            this.props.handleActionDialog(true);
          }}
          style={{ left: this.props.left, top: this.props.top }}
        >
          <div className="action-dialog-actions-container">
            <div
              className="action-dialog-add"
              onClick={() => {
                if (this.props.isFavorite) {
                  this.handleCancelLoveBook();
                } else {
                  this.handleLoveBook();
                }
              }}
            >
              <span className="icon-heart view-icon"></span>
              <p className="action-name">
                {this.props.isFavorite ? <Trans>Remove from favorite</Trans> : <Trans>Add to favorite</Trans>}
              </p>
            </div>
            <div
              className="action-dialog-add"
              onClick={() => {
                this.handleMultiSelect();
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
                this.handleDeleteBook();
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
                this.handleEditBook();
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
                this.handleDetailBook();
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
                this.setState({ isShowExport: true });
                const e = event || window.event;
                let x = e.clientX;
                if (x > document.body.clientWidth - 300) {
                  this.setState({ isExceed: true });
                } else {
                  this.setState({ isExceed: false });
                }
              }}
              onMouseLeave={(event) => {
                this.setState({ isShowExport: false });
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
  }
}

export default ActionDialog;
