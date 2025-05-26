import React from "react";
import "./popupOption.css";

import Note from "../../../models/Note";
import { PopupOptionProps, PopupOptionState } from "./interface";
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
import { getCurrentUser } from "@aws-amplify/auth";

import axios from "axios";
import api from "../../../utils/axios";
// import { speakWithPolly } from "../../../utils/serviceUtils/awsPollyUtil";
import TTSMakerService from "../../../utils/serviceUtils/ttsMakerService";

declare var window: any;

class PopupOption extends React.Component<PopupOptionProps, PopupOptionState> {
  constructor(props: PopupOptionProps) {
    super(props);
    this.state = {
      username: "",
      isProcessing: false,
    };
  }

  private ttsMakerService: TTSMakerService | null = null;

  async componentDidMount() {
    getCurrentUser().then(({ username }) => this.setState({ username }));
  }
  handleNote = () => {
    // this.props.handleChangeDirection(false);
    this.props.handleMenuMode("note");
  };
  handleCopy = () => {
    let text = getSelection();
    if (!text) return;
    copy(text);
    this.props.handleOpenMenu(false);
    let doc = getIframeDoc();
    if (!doc) return;
    doc.getSelection()?.empty();
    toast.success(this.props.t("Copying successful"));
  };
  handleTrans = () => {
    this.props.handleMenuMode("trans");
    this.props.handleOriginalText(getSelection() || "");
  };
  handleDict = () => {
    this.props.handleMenuMode("dict");
    this.props.handleOriginalText(getSelection() || "");
  };
  handleDigest = () => {
    const { username } = this.state;
    let { key: bookKey, file_key } = this.props.currentBook;
    let cfi = "";
    if (this.props.currentBook.format === "PDF") {
      cfi = JSON.stringify(RecordLocation.getPDFLocation(this.props.currentBook.md5.split("-")[0]));
    } else {
      cfi = JSON.stringify(RecordLocation.getHtmlLocation(this.props.currentBook.key));
    }
    let percentage = RecordLocation.getHtmlLocation(this.props.currentBook.key).percentage
      ? RecordLocation.getHtmlLocation(this.props.currentBook.key).percentage
      : 0;
    let color = this.props.color;
    let notes = "";
    let pageArea = document.getElementById("page-area");
    if (!pageArea) return;
    let iframe = pageArea.getElementsByTagName("iframe")[0];
    if (!iframe) return;
    let doc = getIframeDoc();
    if (!doc) return;
    let charRange;
    if (this.props.currentBook.format !== "PDF") {
      charRange = window.rangy.getSelection(iframe).saveCharacterRanges(doc.body)[0];
    }
    let range =
      this.props.currentBook.format === "PDF" ? JSON.stringify(getHightlightCoords()) : JSON.stringify(charRange);
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
      this.props.chapter,
      this.props.chapterDocIndex,
      text,
      cfi,
      range,
      notes,
      percentage,
      color,
      []
    );
    // console.log("digest", digest);
    let noteArr = this.props.notes;
    noteArr.push(digest);
    api
      .post(`/api/highlights/add`, {
        ...digest,
        user_ic: username,
        file_key,
      })
      .then(
        window.localforage.setItem("notes", noteArr).then(() => {
          this.props.handleOpenMenu(false);
          toast.success(this.props.t("Addition successful"));
          this.props.handleFetchNotes();
          this.props.handleMenuMode("");
          createOneNote(digest, this.props.currentBook.format, this.handleNoteClick);
        })
      );
  };

  handleNoteClick = (event: Event) => {
    this.props.handleNoteKey((event.target as any).dataset.key);
    this.props.handleMenuMode("note");
    this.props.handleOpenMenu(true);
  };
  handleJump = (url: string) => {
    openExternalUrl(url);
  };
  handleSearchInternet = () => {
    switch (StorageUtil.getReaderConfig("searchEngine")) {
      case "google":
        this.handleJump("https://www.google.com/search?q=" + getSelection());
        break;
      case "baidu":
        this.handleJump("https://www.baidu.com/s?wd=" + getSelection());
        break;
      case "bing":
        this.handleJump("https://www.bing.com/search?q=" + getSelection());
        break;
      case "duckduckgo":
        this.handleJump("https://duckduckgo.com/?q=" + getSelection());
        break;
      case "yandex":
        this.handleJump("https://yandex.com/search/?text=" + getSelection());
        break;
      case "yahoo":
        this.handleJump("https://search.yahoo.com/search?p=" + getSelection());
        break;
      case "naver":
        this.handleJump(
          "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=" + getSelection()
        );
        break;
      case "baike":
        this.handleJump("https://baike.baidu.com/item/" + getSelection());
        break;
      case "wiki":
        this.handleJump("https://en.wikipedia.org/wiki/" + getSelection());
        break;
      default:
        this.handleJump(
          navigator.language === "zh-CN"
            ? "https://www.baidu.com/s?wd=" + getSelection()
            : "https://www.google.com/search?q=" + getSelection()
        );
        break;
    }
  };
  handleSearchBook = () => {
    // Check if the current book is a PDF
    if (this.props.currentBook && this.props.currentBook.format === "PDF") {
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
      this.props.handleOpenMenu(false);
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
      this.props.handleOpenMenu(false);
    }
  };
  handleSpeak = async () => {
    const selectedText = getSelection() || "";
    if (!selectedText) return;

    try {
      this.setState({ isProcessing: true });

      if (!this.ttsMakerService) {
        this.ttsMakerService = new TTSMakerService();
      }

      // Split text if needed and get audio URL
      const chunks = this.ttsMakerService.splitTextIntoChunks(selectedText);
      const audioUrls = await Promise.all(
        chunks.map((chunk) =>
          this.ttsMakerService!.createTTSOrder({
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
      toast.error(this.props.t("Failed to generate speech"));
    } finally {
      this.setState({ isProcessing: false });
    }
  };
  handleAIChat = () => {
    this.props.handleMenuMode("ai-chat");
  };

  render() {
    const PopupProps = {
      handleDigest: this.handleDigest,
    };
    const renderMenuList = () => {
      return (
        <>
          <div className="menu-list">
            {popupList.map((item, index) => {
              return (
                <div
                  key={item.name}
                  className={`${item.name}-option ${this.state.isProcessing && index === 7 ? "processing" : ""}`}
                  onClick={() => {
                    switch (index) {
                      case 0:
                        this.handleNote();
                        break;
                      case 1:
                        this.handleDigest();
                        break;
                      case 2:
                        this.handleTrans();
                        break;
                      case 3:
                        this.handleCopy();
                        break;
                      case 4:
                        this.handleSearchBook();
                        break;
                      case 5:
                        this.handleDict();
                        break;
                      case 6:
                        this.handleSearchInternet();
                        break;
                      case 7:
                        if (!this.state.isProcessing) {
                          this.handleSpeak();
                        }
                        break;
                      case 8:
                        this.handleAIChat();
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  <span data-tooltip-id="my-tooltip" data-tooltip-content={this.props.t(item.title)}>
                    <span
                      className={`icon-${item.icon} ${item.name}-icon ${
                        this.state.isProcessing && index === 7 ? "spin" : ""
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
  }
}

export default PopupOption;
