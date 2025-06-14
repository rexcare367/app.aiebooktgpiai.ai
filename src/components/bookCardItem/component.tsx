//src/components/bookCardItem/component.tsx
import React from "react";
import RecentBooks from "../../utils/readUtils/recordRecent";
import "./bookCardItem.css";
import { BookCardProps, BookCardState } from "./interface";
import AddFavorite from "../../utils/readUtils/addFavorite";
import ActionDialog from "../dialogs/actionDialog";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { withRouter } from "react-router-dom";
// import RecordLocation from "../../utils/readUtils/recordLocation";
import { isElectron } from "react-device-detect";
// import EmptyCover from "../emptyCover";
import BookUtil from "../../utils/fileUtils/bookUtil";

declare var window: any;

class BookCardItem extends React.Component<BookCardProps, BookCardState> {
  constructor(props: BookCardProps) {
    super(props);
    this.state = {
      isFavorite: AddFavorite.getAllFavorite().indexOf(this.props.book.file_key) > -1,
      left: 0,
      top: 0,
      direction: "horizontal",
      isHover: false,
    };
  }

  componentDidMount() {
    let filePath = "";
    //open book when app start
    if (isElectron) {
      const { ipcRenderer } = window.require("electron");
      filePath = ipcRenderer.sendSync("get-file-data");
    }

    if (
      StorageUtil.getReaderConfig("isOpenBook") === "yes" &&
      RecentBooks.getAllRecent()[0] === this.props.book.file_key &&
      !this.props.currentBook.file_key &&
      !filePath
    ) {
      this.props.handleReadingBook(this.props.book);

      BookUtil.RedirectBook(this.props.book, this.props.t, this.props.history);
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps: BookCardProps) {
    if (nextProps.book.file_key !== this.props.book.file_key) {
      this.setState({
        isFavorite: AddFavorite.getAllFavorite().indexOf(nextProps.book.file_key) > -1,
      });
    }
  }

  handleMoreAction = (event: any) => {
    event.preventDefault();
    const e = event || window.event;
    let x = e.clientX;
    if (x > document.body.clientWidth - 300) {
      x = x - 190;
    } else {
      x = x - 10;
    }
    this.setState(
      {
        left: x,
        top: document.body.clientHeight - e.clientY > 250 ? e.clientY - 10 : e.clientY - 220,
      },
      () => {
        this.props.handleActionDialog(true);
        this.props.handleReadingBook(this.props.book);
      }
    );
  };

  handleJump = async () => {
    if (this.props.isSelectBook) {
      this.props.handleSelectedBooks(
        this.props.isSelected
          ? this.props.selectedBooks.filter((item) => item !== this.props.book.file_key)
          : [...this.props.selectedBooks, this.props.book.file_key]
      );
      return;
    }
    console.log("start load");
    await this.props.loadContentBook({
      ...this.props.book,
      source_url: this.props.book.url,
      name: this.props.book.title,
    });
    console.log("end load");

    await RecentBooks.setRecent(this.props.book.file_key);
    this.props.handleReadingBook(this.props.book);
    BookUtil.RedirectBook(this.props.book, this.props.t, this.props.history);
  };

  render() {
    let percentage = "0";
    // if (this.props.book.format === "PDF") {
    //   if (
    //     RecordLocation.getPDFLocation(this.props.book.md5.split("-")[0]) &&
    //     RecordLocation.getPDFLocation(this.props.book.md5.split("-")[0]).page &&
    //     this.props.book.page
    //   ) {
    //     percentage =
    //       RecordLocation.getPDFLocation(this.props.book.md5.split("-")[0])
    //         .page /
    //         this.props.book.page +
    //       "";
    //   }
    // } else {
    //   if (
    //     RecordLocation.getHtmlLocation(this.props.book.file_key) &&
    //     RecordLocation.getHtmlLocation(this.props.book.file_key).percentage
    //   ) {
    //     percentage = RecordLocation.getHtmlLocation(
    //       this.props.book.file_key
    //     ).percentage;
    //   }
    // }
    // let percentage = 0;
    const actionProps = {
      left: this.state.left,
      top: this.state.top,
      isFavorite: this.props.isFavorite,
      loadFavoriteBooks: this.props.loadFavoriteBooks,
    };
    return (
      <>
        <div
          className="book-list-item w-52 h-fit m-2 float-left relative col-span-1"
          onContextMenu={(event) => {
            this.handleMoreAction(event);
          }}
        >
          <div
            className="book-item-cover w-full p-5 opacity-100 cursor-pointer flex justify-center"
            onClick={() => {
              this.handleJump();
            }}
            onMouseEnter={() => {
              this.setState({ isHover: true });
            }}
            onMouseLeave={() => {
              this.setState({ isHover: false });
            }}
            style={
              StorageUtil.getReaderConfig("isDisableCrop") === "yes"
                ? {
                    height: "308px",
                    alignItems: "flex-end",
                    background: "rgba(255, 255,255, 0)",
                    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0)",
                  }
                : {
                    height: "278px",
                    alignItems: "center",
                    overflow: "hidden",
                  }
            }
          >
            <img
              data-src={this.props.book.thumbnail}
              alt=""
              className="lazy-image book-item-image"
              style={
                this.state.direction === "horizontal" || StorageUtil.getReaderConfig("isDisableCrop") === "yes"
                  ? { width: "100%" }
                  : { height: "100%" }
              }
              onLoad={(res: any) => {
                if (res.target.naturalHeight / res.target.naturalWidth > 137 / 105) {
                  this.setState({ direction: "horizontal" });
                } else {
                  this.setState({ direction: "vertical" });
                }
              }}
            ></img>
          </div>
          {this.props.isSelectBook || this.state.isHover ? (
            <span
              className="icon-message book-selected-icon"
              onMouseEnter={() => {
                this.setState({ isHover: true });
              }}
              onClick={(event) => {
                if (this.props.isSelectBook) {
                  this.props.handleSelectedBooks(
                    this.props.isSelected
                      ? this.props.selectedBooks.filter((item) => item !== this.props.book.file_key)
                      : [...this.props.selectedBooks, this.props.book.file_key]
                  );
                } else {
                  this.props.handleSelectBook(true);
                  this.props.handleSelectedBooks([this.props.book.file_key]);
                }
                this.setState({ isHover: false });
                event?.stopPropagation();
              }}
              style={
                this.props.isSelected
                  ? { opacity: 1 }
                  : {
                      color: "#eee",
                    }
              }
            ></span>
          ) : null}

          <p className="book-item-title">{this.props.book.name}</p>
          <div className="reading-progress-icon">
            <div style={{ position: "relative", left: "4px" }}>
              {percentage && !isNaN(parseFloat(percentage))
                ? Math.floor(parseFloat(percentage) * 100) === 0
                  ? "New"
                  : Math.floor(parseFloat(percentage) * 100) < 10
                  ? Math.floor(parseFloat(percentage) * 100)
                  : Math.floor(parseFloat(percentage) * 100) === 100
                  ? "Done"
                  : Math.floor(parseFloat(percentage) * 100)
                : "0"}
              {Math.floor(parseFloat(percentage) * 100) > 0 && Math.floor(parseFloat(percentage) * 100) < 100 && (
                <span>%</span>
              )}
            </div>
          </div>
          <span
            className="icon-more book-more-action"
            onClick={(event) => {
              this.handleMoreAction(event);
            }}
          ></span>
        </div>

        {this.props.isOpenActionDialog && this.props.book.file_key === this.props.currentBook.file_key ? (
          <div className="action-dialog-parent">
            <ActionDialog {...actionProps} />
          </div>
        ) : null}
      </>
    );
  }
}
export default withRouter(BookCardItem as any);
