import React, { useState, useEffect, useCallback } from "react";
import "./popupNote.css";
import Note from "../../../models/Note";

import { PopupNoteProps } from "./interface";
import RecordLocation from "../../../utils/readUtils/recordLocation";
import NoteTag from "../../noteTag";
import NoteModel from "../../../models/Note";
import { Trans } from "react-i18next";
import toast from "react-hot-toast";
import { getHightlightCoords, removePDFHighlight } from "../../../utils/fileUtils/pdfUtil";
import { getIframeDoc } from "../../../utils/serviceUtils/docUtil";
import { createOneNote, removeOneNote } from "../../../utils/serviceUtils/noteUtil";
import { classes } from "../../../constants/themeList";
import { useCurrentUserId } from "../../../utils/authUtils";
import api from "../../../utils/axios";
import authService, { UserData } from "../../../utils/authService";

declare var window: any;

const PopupNote: React.FC<PopupNoteProps> = (props) => {
  const [tag, setTag] = useState<string[]>([]);
  const [text, setText] = useState<string>("");
  
  const userData: UserData | null = authService.getUserData();
  // const userId = userData?.id;
  const user_ic = userData?.ic_number;

  useEffect(() => {
    let textArea: any = document.querySelector(".editor-box");
    textArea && textArea.focus();
    if (props.noteKey) {
      let noteIndex = window._.findLastIndex(props.notes, {
        key: props.noteKey,
      });
      setText(props.notes[noteIndex].text);
      textArea.value = props.notes[noteIndex].notes;
    } else {
      let doc = getIframeDoc();
      if (!doc) {
        return;
      }
      let text = doc.getSelection()?.toString();
      if (!text) {
        return;
      }
      text = text.replace(/\s\s/g, "");
      text = text.replace(/\r/g, "");
      text = text.replace(/\n/g, "");
      text = text.replace(/\t/g, "");
      text = text.replace(/\f/g, "");
      setText(text);
    }
  }, [props.noteKey, props.notes]);

  const handleTag = useCallback((tag: string[]) => {
    setTag(tag);
  }, []);

  const handleNoteClick = useCallback((event: Event) => {
    props.handleNoteKey((event.target as any).dataset.key);
    props.handleMenuMode("note");
    props.handleOpenMenu(true);
  }, [props]);

  const createNote = useCallback(() => {
    let { file_key } = props.currentBook;
    let notes = (document.querySelector(".editor-box") as HTMLInputElement).value;
    let cfi = "";
    if (props.currentBook.format === "PDF") {
      cfi = JSON.stringify(RecordLocation.getPDFLocation(props.currentBook.md5.split("-")[0]));
    } else {
      cfi = JSON.stringify(RecordLocation.getHtmlLocation(props.currentBook.key));
    }
    if (props.noteKey) {
      let _item;
      props.notes.forEach((item) => {
        if (item.key === props.noteKey) {
          item.notes = notes;
          item.tag = tag;
          item.cfi = cfi;
          _item = item;
        }
      });

      api
        .put(`/api/highlights/${props.noteKey}`, {
          ..._item,
          user_ic: user_ic,
          file_key,
        })
        .then(
          window.localforage.setItem("notes", props.notes).then(() => {
            props.handleOpenMenu(false);
            toast.success(props.t("Addition successful"));
            props.handleFetchNotes();
            props.handleMenuMode("");
            props.handleNoteKey("");
          })
        );
    } else {
      let { key: bookKey, file_key } = props.currentBook;

      let pageArea = document.getElementById("page-area");
      if (!pageArea) return;
      let iframe = pageArea.getElementsByTagName("iframe")[0];
      if (!iframe) return;
      let doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      let charRange;
      if (props.currentBook.format !== "PDF") {
        charRange = window.rangy.getSelection(iframe).saveCharacterRanges(doc.body)[0];
      }

      let range =
        props.currentBook.format === "PDF" ? JSON.stringify(getHightlightCoords()) : JSON.stringify(charRange);

      let percentage = 0;

      let color = props.color || 0;

      let note = new Note(
        bookKey,
        file_key,
        props.chapter,
        props.chapterDocIndex,
        text,
        cfi,
        range,
        notes,
        percentage,
        color,
        tag
      );

      let noteArr = props.notes;
      noteArr.push(note);
      api
        .post(`/api/highlights/add`, {
          ...note,
          user_ic: user_ic,
          book_id: bookKey,
        })
        .then(
          window.localforage.setItem("notes", noteArr).then(() => {
            props.handleOpenMenu(false);
            toast.success(props.t("Addition successful"));
            props.handleFetchNotes();
            props.handleMenuMode("");
            createOneNote(note, props.currentBook.format, handleNoteClick);
          })
        );
    }
  }, [props, tag, text, handleNoteClick]);

  const handleClose = useCallback(() => {
    let noteIndex = -1;
    let note: NoteModel;
    if (props.noteKey) {
      props.notes.forEach((item, index) => {
        if (item.key === props.noteKey) {
          noteIndex = index;
          note = item;
        }
      });
      if (noteIndex > -1) {
        props.notes.splice(noteIndex, 1);
        api.delete(`/api/highlights/${props.noteKey}`).then(
          window.localforage.setItem("notes", props.notes).then(() => {
            if (props.currentBook.format === "PDF") {
              removePDFHighlight(JSON.parse(note.range), classes[note.color], note.key);
            }

            toast.success(props.t("Deletion successful"));
            props.handleMenuMode("");
            props.handleFetchNotes();
            props.handleNoteKey("");
            removeOneNote(note.key, props.currentBook.format);
            props.handleOpenMenu(false);
          })
        );
      }
    } else {
      props.handleOpenMenu(false);
      props.handleMenuMode("");
      props.handleNoteKey("");
    }
  }, [props]);

  let note: NoteModel;
  if (props.noteKey) {
    props.notes.forEach((item) => {
      if (item.key === props.noteKey) {
        note = item;
      }
    });
  }

  const renderNoteEditor = () => {
    return (
      <div className="note-editor">
        <div className="note-original-text">{text}</div>
        <div className="editor-box-parent">
          <textarea className="editor-box" />
        </div>
        <div className="note-tags" style={{ position: "absolute", bottom: "0px", height: "40px" }}>
          <NoteTag
            {...{
              handleTag: handleTag,
              tag: props.noteKey && note ? note.tag : [],
            }}
          />
        </div>

        <div className="note-button-container">
          <span
            className="book-manage-title"
            onClick={() => {
              handleClose();
            }}
          >
            {props.noteKey ? <Trans>Delete</Trans> : <Trans>Cancel</Trans>}
          </span>
          <span
            className="book-manage-title"
            onClick={() => {
              createNote();
            }}
          >
            <Trans>Create Note</Trans>
          </span>
        </div>
      </div>
    );
  };
  return renderNoteEditor();
};

export default PopupNote;
