import React from "react";
import "./cardList.css";
import NoteModel from "../../../models/Note";
import { Trans } from "react-i18next";
import { CardListProps, CardListStates } from "./interface";
import DeleteIcon from "../../../components/deleteIcon";
import RecordLocation from "../../../utils/readUtils/recordLocation";
import { withRouter } from "react-router-dom";
import SortUtil from "../../../utils/readUtils/sortUtil";
import { Redirect } from "react-router-dom";
import NoteTag from "../../../components/noteTag";
import BookUtil from "../../../utils/fileUtils/bookUtil";
import toast from "react-hot-toast";
import BookModel from "../../../models/Book";
import axios from "axios";
import api from "../../../utils/axios";
import moment from "moment";
import { fetchMD5 } from "../../../utils/fileUtils/md5Util";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import RecordRecent from "../../../utils/readUtils/recordRecent";

class CardList extends React.Component<CardListProps, CardListStates> {
  constructor(props: CardListProps) {
    super(props);
    this.state = { deleteKey: "" };
  }
  handleBookName = (bookKey: string) => {
    let { books } = this.props;
    let bookName = "";
    for (let i = 0; i < this.props.books.length; i++) {
      if (books[i].key === bookKey) {
        bookName = books[i].name;
        break;
      }
    }
    return bookName;
  };
  handleShowDelete = (deleteKey: string) => {
    this.setState({ deleteKey });
  };
  handleJump = async (note: NoteModel) => {
    console.log("===== note", note);
    let bookData: any = await api.get(`/api/ebooks/${note.file_key}`).then((res) => res.data.data);
    let sourceUrl = bookData.url.replace(/_/g, "+");
    console.log("Fetching from URL:", sourceUrl); // Debug log

    // Fetch bookData content
    const response = await axios.get<ArrayBuffer>(sourceUrl, { responseType: "arraybuffer" });
    const arrayBuffer = response.data;
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: "application/pdf" });
    const file = new File([blob], bookData.title, { type: "application/pdf" });

    // Calculate MD5 and process the book
    const md5 = await fetchMD5(file);
    if (!md5) {
      throw new Error("Failed to calculate MD5");
    }

    // Generate book model
    const key = moment(bookData.upload_time).unix().toString();
    const result = await BookUtil.generateBook(
      bookData.title,
      "pdf", // Assuming PDF format, adjust if needed
      md5,
      file.size,
      "", // Empty string for path since we're using source_url
      arrayBuffer,
      bookData.file_key,
      bookData.thumbnail,
      bookData.thumb_url,
      sourceUrl, // Use the processed URL
      key
    );

    if (result === "get_metadata_error") {
      throw new Error("Failed to get book metadata");
    }

    // Add book to storage
    if (StorageUtil.getReaderConfig("isImportPath") !== "yes") {
      await BookUtil.addBook(key, arrayBuffer);
    }

    // Update local storage and recent books
    const bookModel = result as BookModel;
    bookModel.key = key;
    RecordRecent.setRecent(bookModel.key);

    // Save to localforage
    const existingBooks = (await window.localforage.getItem<BookModel[]>("books")) || [];
    const bookIndex = existingBooks.findIndex((b) => b.file_key === bookData.file_key);
    if (bookIndex !== -1) {
      existingBooks[bookIndex] = bookModel;
    } else {
      existingBooks.push(bookModel);
    }
    await window.localforage.setItem("books", existingBooks);

    console.log("===== existingBooks", existingBooks);
    const _existingBooks = [...existingBooks];
    console.log("----- _existingBooks", _existingBooks);
    // let { books } = this.props;
    let books = _existingBooks;
    console.log("===== books", books);
    let book: BookModel | null = null;
    for (let i = 0; i < books.length; i++) {
      if (books[i].key === note.bookKey) {
        book = books[i];
        break;
      }
    }
    if (!book) {
      toast(this.props.t("Book not exist"));
      return;
    }

    if (book.format === "PDF") {
      let bookLocation = JSON.parse(note.cfi) || {};
      RecordLocation.recordPDFLocation(book.md5.split("-")[0], bookLocation);
    } else {
      let bookLocation: any = {};
      //compatile wiht lower version(1.4.2)
      try {
        bookLocation = JSON.parse(note.cfi) || {};
      } catch (error) {
        bookLocation.cfi = note.cfi;
        bookLocation.chapterTitle = note.chapter;
      }
      RecordLocation.recordHtmlLocation(
        note.bookKey,
        bookLocation.text,
        bookLocation.chapterTitle,
        bookLocation.chapterDocIndex,
        bookLocation.chapterHref,
        bookLocation.count,
        bookLocation.percentage,
        bookLocation.cfi,
        bookLocation.page
      );
    }

    BookUtil.RedirectBook(book, this.props.t, this.props.history);
  };
  render() {
    let { cards } = this.props;
    if (cards.length === 0) {
      return <Redirect to="/manager/empty" />;
    }

    let noteObj = SortUtil.sortNotes(cards, this.props.noteSortCode, this.props.books);
    const renderCardListItem = (title: string) => {
      return noteObj![title].map((item: NoteModel, index: number) => {
        const cardProps = {
          itemKey: item.key,
          mode: "notes",
        };
        return (
          <li
            className="card-list-item"
            key={index}
            onMouseOver={() => {
              this.handleShowDelete(item.key);
            }}
            onMouseLeave={() => {
              this.handleShowDelete("");
            }}
            style={
              this.props.mode === "note" && !this.props.isCollapsed
                ? { height: "250px" }
                : this.props.mode === "note" && this.props.isCollapsed
                ? { height: "250px", width: "calc(50vw - 70px)" }
                : this.props.isCollapsed
                ? { width: "calc(50vw - 70px)" }
                : {}
            }
          >
            <div className="card-list-item-card">
              <div style={{ position: "relative", bottom: "25px" }}>
                {this.state.deleteKey === item.key ? <DeleteIcon {...cardProps} /> : null}
              </div>
              <div className="card-list-item-text-parent">
                <div className="card-list-item-note">{this.props.mode === "note" ? item.notes : item.text}</div>
              </div>
              {this.props.mode === "note" ? (
                <div className="card-list-item-text-note">
                  <div className="card-list-item-text">{item.text}</div>
                </div>
              ) : null}

              <div className="card-list-item-citation">
                <div className="card-list-item-title">
                  <Trans>From</Trans>《
                </div>
                <div className="card-list-item-chapter card-list-item-title">{this.handleBookName(item.bookKey)}</div>
                <div className="card-list-item-chapter card-list-item-title">》{item.chapter}</div>
              </div>
              <div
                className="note-tags"
                style={{
                  position: "absolute",
                  bottom: "60px",
                  height: "30px",
                  overflow: "hidden",
                }}
              >
                <NoteTag
                  {...{
                    handleTag: () => {},
                    tag: item.tag || [],
                    isCard: true,
                  }}
                />
              </div>
              <div
                onClick={() => {
                  this.handleJump(item);
                }}
              >
                <div className="card-list-item-show-more" style={{ bottom: "10px" }}>
                  {this.props.mode === "note" ? <Trans>{"More notes"}</Trans> : <Trans>{"Show in the book"}</Trans>}

                  <span className="icon-dropdown icon-card-right"></span>
                </div>
              </div>
            </div>
          </li>
        );
      });
    };
    const renderCardList = () => {
      return Object.keys(noteObj!).map((item, index) => {
        return (
          <li className="card-page-item" key={index}>
            <div className="card-page-item-date">{item}</div>
            <ul className="card-list-container-box">{renderCardListItem(item)}</ul>
          </li>
        );
      });
    };
    return <div className="card-list-container">{renderCardList()}</div>;
  }
}

export default withRouter(CardList as any);
