import React, { useState, useEffect, useRef } from "react";
import "./popupOption.css";

import Note from "../../../models/Note";
import { PopupOptionProps } from "./interface";
import ColorOption from "../../colorOption";
import RecordLocation from "../../../utils/readUtils/recordLocation";

import { popupList } from "../../../constants/popupList";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import toast from "react-hot-toast";
import { getSelection } from "../../../utils/serviceUtils/mouseEvent";
import copy from "copy-text-to-clipboard";
import { getHightlightCoords } from "../../../utils/fileUtils/pdfUtil";
import { getIframeDoc } from "../../../utils/serviceUtils/docUtil";
import { openExternalUrl } from "../../../utils/serviceUtils/urlUtil";
// import { isElectron } from "react-device-detect";
import { createOneNote } from "../../../utils/serviceUtils/noteUtil";
import { useCurrentUserId } from "../../../utils/authUtils";

import axios from "axios";
import api from "../../../utils/axios";
// import { speakWithPolly } from "../../../utils/serviceUtils/awsPollyUtil";
import TTSMakerService from "../../../utils/serviceUtils/ttsMakerService";
import authService, { UserData } from "../../../utils/authService";

declare var window: any;

const PopupOption: React.FC<PopupOptionProps> = (props) => {
  // const userId = useCurrentUserId();
  const userData: UserData | null = authService.getUserData();
  // const userId = userData?.id;
  const user_ic = userData?.ic_number;
  const [isProcessing, setIsProcessing] = useState(false);
  
  const ttsMakerServiceRef = useRef<TTSMakerService | null>(null);


  const handleNote = () => {
    // props.handleChangeDirection(false);
    props.handleMenuMode("note");
  };

  const handleCopy = () => {
    let text = getSelection();
    if (!text) return;
    copy(text);
    props.handleOpenMenu(false);
    let doc = getIframeDoc();
    if (!doc) return;
    doc.getSelection()?.empty();
    toast.success(props.t("Copying successful"));
  };

  const handleTrans = () => {
    props.handleMenuMode("trans");
    props.handleOriginalText(getSelection() || "");
  };

  const handleDict = () => {
    props.handleMenuMode("dict");
    props.handleOriginalText(getSelection() || "");
  };

  const handleDigest = () => {
    let { key: bookKey, file_key } = props.currentBook;
    let cfi = "";
    if (props.currentBook.format === "PDF") {
      cfi = JSON.stringify(RecordLocation.getPDFLocation(props.currentBook.md5.split("-")[0]));
    } else {
      cfi = JSON.stringify(RecordLocation.getHtmlLocation(props.currentBook.key));
    }
    let percentage = RecordLocation.getHtmlLocation(props.currentBook.key).percentage
      ? RecordLocation.getHtmlLocation(props.currentBook.key).percentage
      : 0;
    let color = props.color;
    let notes = "";
    let pageArea = document.getElementById("page-area");
    if (!pageArea) return;
    let iframe = pageArea.getElementsByTagName("iframe")[0];
    if (!iframe) return;
    let doc = getIframeDoc();
    if (!doc) return;
    let charRange;
    if (props.currentBook.format !== "PDF") {
      charRange = window.rangy.getSelection(iframe).saveCharacterRanges(doc.body)[0];
    }
    let range =
      props.currentBook.format === "PDF" ? JSON.stringify(getHightlightCoords()) : JSON.stringify(charRange);
    let text = doc.getSelection()?.toString();
    if (!text) return;
    text = text.replace(/\s\s/g, "");
    text = text.replace(/\r/g, "");
    text = text.replace(/\n/g, "");
    text = text.replace(/\t/g, "");
    text = text.replace(/\f/g, "");
    let digest = new Note(
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
      []
    );
    // console.log("digest", digest);
    let noteArr = props.notes;
    noteArr.push(digest);
    api
      .post(`/api/highlights/add`, {
        ...digest,
        user_ic: user_ic,
        book_id: bookKey,
      })
      .then(
        window.localforage.setItem("notes", noteArr).then(() => {
          props.handleOpenMenu(false);
          toast.success(props.t("Addition successful"));
          props.handleFetchNotes();
          props.handleMenuMode("");
          createOneNote(digest, props.currentBook.format, handleNoteClick);
        })
      );
  };

  const handleNoteClick = (event: Event) => {
    props.handleNoteKey((event.target as any).dataset.key);
    props.handleMenuMode("note");
    props.handleOpenMenu(true);
  };

  const handleJump = (url: string) => {
    openExternalUrl(url);
  };

  const handleSearchInternet = () => {
    switch (StorageUtil.getReaderConfig("searchEngine")) {
      case "google":
        handleJump("https://www.google.com/search?q=" + getSelection());
        break;
      case "baidu":
        handleJump("https://www.baidu.com/s?wd=" + getSelection());
        break;
      case "bing":
        handleJump("https://www.bing.com/search?q=" + getSelection());
        break;
      case "duckduckgo":
        handleJump("https://duckduckgo.com/?q=" + getSelection());
        break;
      case "yandex":
        handleJump("https://yandex.com/search/?text=" + getSelection());
        break;
      case "yahoo":
        handleJump("https://search.yahoo.com/search?p=" + getSelection());
        break;
      case "naver":
        handleJump(
          "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=" + getSelection()
        );
        break;
      case "baike":
        handleJump("https://baike.baidu.com/item/" + getSelection());
        break;
      case "wiki":
        handleJump("https://en.wikipedia.org/wiki/" + getSelection());
        break;
      default:
        handleJump(
          navigator.language === "zh-CN"
            ? "https://www.baidu.com/s?wd=" + getSelection()
            : "https://www.google.com/search?q=" + getSelection()
        );
        break;
    }
  };
  const handleSearchBook = () => {
    // Check if the current book is a PDF
    if (props.currentBook && props.currentBook.format === "PDF") {
      // For PDF files, use PDF.js built-in search functionality
      let pageArea = document.getElementById("page-area");
      if (!pageArea) return;
      let iframe = pageArea.getElementsByTagName("iframe")[0];
      if (!iframe) return;
      let iWin: any = iframe.contentWindow || iframe.contentDocument?.defaultView;
      if (!iWin || !iWin.PDFViewerApplication) return;

      // Get the selected text
      const searchText = getSelection() || "";
      if (!searchText) return;

      // Open the find bar in PDF.js
      iWin.PDFViewerApplication.appConfig.toolbar.viewFind.click();

      // Set the search text in the find field
      setTimeout(() => {
        const findField = iWin.document.getElementById("findInput");
        if (findField) {
          findField.value = searchText;

          // Trigger the search event
          const event = new Event("input", { bubbles: true });
          findField.dispatchEvent(event);

          // Press Enter to start the search
          const keyEvent = new KeyboardEvent("keydown", {
            code: "Enter",
            key: "Enter",
            bubbles: true,
            cancelable: true,
          });
          findField.dispatchEvent(keyEvent);
        }
      }, 100); // Small delay to ensure the find bar is open

      // Close the popup menu
      props.handleOpenMenu(false);
    } else {
      // Original behavior for HTML books
      let leftPanel = document.querySelector(".left-panel");
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      if (!leftPanel) return;
      leftPanel.dispatchEvent(clickEvent);
      const focusEvent = new MouseEvent("focus", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      let searchBox: any = document.querySelector(".header-search-box");
      searchBox.dispatchEvent(focusEvent);
      let searchIcon = document.querySelector(".header-search-icon");
      searchIcon?.dispatchEvent(clickEvent);
      searchBox.value = getSelection() || "";
      const keyEvent: any = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: "Enter",
        key: "Enter",
      } as any);
      searchBox.dispatchEvent(keyEvent);
      props.handleOpenMenu(false);
    }
  };
  const handleSpeak = async () => {
    const selectedText = getSelection() || "";
    if (!selectedText) return;

    try {
      setIsProcessing(true);

      if (!ttsMakerServiceRef.current) {
        ttsMakerServiceRef.current = new TTSMakerService();
      }

      // Split text if needed and get audio URL
      const chunks = ttsMakerServiceRef.current.splitTextIntoChunks(selectedText);
      const audioUrls = await Promise.all(
        chunks.map((chunk) =>
          ttsMakerServiceRef.current!.createTTSOrder({
            text: chunk,
            audio_format: "mp3",
            audio_speed: 1,
            audio_high_quality: 1,
            emotion_style_key: "assistant",
          })
        )
      );

      // Play the audio
      for (const url of audioUrls) {
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play().catch(reject);
        });
      }
    } catch (error) {
      console.error("TTS Maker error:", error);
      toast.error(props.t("Failed to generate speech"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIChat = () => {
    props.handleMenuMode("ai-chat");
  };

  const PopupProps = {
    handleDigest: handleDigest,
  };

  const renderMenuList = () => {
    return (
      <>
        <div className="menu-list">
          {popupList.map((item, index) => {
            return (
              <div
                key={item.name}
                className={`${item.name}-option ${isProcessing && index === 7 ? "processing" : ""}`}
                onClick={() => {
                  switch (index) {
                    case 0:
                      handleNote();
                      break;
                    case 1:
                      handleDigest();
                      break;
                    case 2:
                      handleTrans();
                      break;
                    case 3:
                      handleCopy();
                      break;
                    case 4:
                      handleSearchBook();
                      break;
                    case 5:
                      handleDict();
                      break;
                    case 6:
                      handleSearchInternet();
                      break;
                    case 7:
                      if (!isProcessing) {
                        handleSpeak();
                      }
                      break;
                    case 8:
                      handleAIChat();
                      break;
                    default:
                      break;
                  }
                }}
              >
                <span data-tooltip-id="my-tooltip" data-tooltip-content={props.t(item.title)}>
                  <span
                    className={`icon-${item.icon} ${item.name}-icon ${
                      isProcessing && index === 7 ? "spin" : ""
                    }`}
                  ></span>
                </span>
              </div>
            );
          })}
        </div>
        <ColorOption {...PopupProps} />
      </>
    );
  };

  return renderMenuList();
};

export default PopupOption;
