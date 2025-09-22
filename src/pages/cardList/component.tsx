import React, { useState } from "react";
import "./cardList.css";
import NoteModel from "../../models/Note";
import { CardListProps } from "./interface";
import DeleteIcon from "../../components/deleteIcon";
import RecordLocation from "../../utils/readUtils/recordLocation";
import { withRouter } from "react-router-dom";
import EmptyPage from "../emptyPage/component";
import BookUtil from "../../utils/fileUtils/bookUtil";
import toast from "react-hot-toast";
import BookModel from "../../models/Book";
import axios from "axios";
import api from "../../utils/axios";
import moment from "moment";
import { fetchMD5 } from "../../utils/fileUtils/md5Util";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import RecordRecent from "../../utils/readUtils/recordRecent";

const CardList: React.FC<CardListProps> = (props) => {
  const [deleteKey, setDeleteKey] = useState<string>("");

  const handleBookName = (bookKey: string) => {
    let { books } = props;
    let bookName = "";
    if (books && books.length > 0)
      for (let i = 0; i < books.length; i++) {
        if (books[i].key === bookKey) {
          bookName = books[i].name;
          break;
        }
      }
    return bookName;
  };

  const handleShowDelete = (key: string) => {
    setDeleteKey(key);
  };

  const handleJump = async (note: NoteModel) => {
    console.log("===== note", note);
    let bookData: any = await api.get(`/api/ebooks/${note.file_key}`).then((res) => res.data.data);
    let sourceUrl = bookData.url.replace(/_/g, "+");
    console.log("Fetching from URL:", sourceUrl);

    const response = await axios.get<ArrayBuffer>(sourceUrl, { responseType: "arraybuffer" });
    const arrayBuffer = response.data;
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: "application/pdf" });
    const file = new File([blob], bookData.title, { type: "application/pdf" });

    const md5 = await fetchMD5(file);
    if (!md5) {
      throw new Error("Failed to calculate MD5");
    }

    const key = moment(bookData.upload_time).unix().toString();
    const result = await BookUtil.generateBook(
      bookData.title,
      "pdf",
      md5,
      file.size,
      "",
      arrayBuffer,
      bookData.file_key,
      bookData.thumbnail,
      bookData.thumb_url,
      sourceUrl,
      key
    );

    if (result === "get_metadata_error") {
      throw new Error("Failed to get book metadata");
    }

    if (StorageUtil.getReaderConfig("isImportPath") !== "yes") {
      await BookUtil.addBook(key, arrayBuffer);
    }

    const bookModel = result as BookModel;
    bookModel.key = key;
    RecordRecent.setRecent(bookModel.key);

    const existingBooks = (await window.localforage.getItem<BookModel[]>("books")) || [];
    const bookIndex = existingBooks.findIndex((b) => b.file_key === bookData.file_key);
    if (bookIndex !== -1) {
      existingBooks[bookIndex] = bookModel;
    } else {
      existingBooks.push(bookModel);
    }
    await window.localforage.setItem("books", existingBooks);

    const _existingBooks = [...existingBooks];
    let books = _existingBooks;

    let book: BookModel | null = null;
    for (let i = 0; i < books.length; i++) {
      if (books[i].key === note.bookKey) {
        book = books[i];
        break;
      }
    }
    if (!book) {
      toast(props.t("Book not exist"));
      return;
    }

    if (book.format === "PDF") {
      let bookLocation = JSON.parse(note.cfi) || {};
      RecordLocation.recordPDFLocation(book.md5.split("-")[0], bookLocation);
    } else {
      let bookLocation: any = {};
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

    BookUtil.RedirectBook(book, props.t, props.history);
  };

  let { cards, mode } = props;
  console.log('cards', cards)
  if (cards.length === 0) {
    return <EmptyPage mode={mode} isCollapsed={props.isCollapsed} />;
  }

  const renderCardListItem = (card: any) => {
    return (
      <li
        className="card-list-item"
        onMouseOver={() => {
          handleShowDelete(card.id);
        }}
        onMouseLeave={() => {
          handleShowDelete("");
        }}
        style={
          mode === "note" && !props.isCollapsed
            ? { height: "250px" }
            : mode === "note" && props.isCollapsed
            ? { height: "250px", width: "calc(50vw - 70px)" }
            : props.isCollapsed
            ? { width: "calc(50vw - 70px)" }
            : {}
        }
      >
        <div className="card-list-item-card">
          <div style={{ position: "relative", bottom: "25px" }}>
            {deleteKey === card.id ? <DeleteIcon {...card} /> : null}
          </div>
          <div className="card-list-item-header">
            <div className="card-list-item-date">
              {moment(`${card.date.year}-${card.date.month}-${card.date.day}`).format("DD MMMM YYYY")}
            </div>
            <div className="card-list-item-topic">
              <span className="card-list-item-dot"></span>
              <span>{card.book.title}</span>
            </div>
          </div>
          <div className={`relative w-full mb-2.5 ${mode === "note" ? "h-16" : "h-28"}`}>
            <div className="w-full h-full overflow-y-scroll mx-2.5 relative cursor-text text-sm pr-1 overflow-x-hidden">
              {mode === "note" ? card.notes : card.text}
            </div>
          </div>
            {mode === "note" ? (
              <div className=" relative w-full h-16 opacity-100">
                <div className="card-list-item-text">{card.text}</div>
              </div>
            ) : null}
        </div>
      </li>
    );
  };

  return (
    <div className="w-full overflow-y-scroll content-start select-text h-full grid 2xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2">
      {cards.map((card) => renderCardListItem(card))}
    </div>
  );
};

export default withRouter(CardList as any);
