import React, { useCallback, useEffect, useState, useRef } from "react";
import RecentBooks from "../../utils/readUtils/recordRecent";
import { ViewerProps, ViewerState } from "./interface";
import { withRouter } from "react-router-dom";
import BookUtil from "../../utils/fileUtils/bookUtil";
import PopupMenu from "../../components/popups/popupMenu";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import RecordLocation from "../../utils/readUtils/recordLocation";
import Background from "../../components/background";
import toast from "react-hot-toast";
import StyleUtil from "../../utils/readUtils/styleUtil";
import "./index.css";
import { HtmlMouseEvent } from "../../utils/serviceUtils/mouseEvent";
import ImageViewer from "../../components/imageViewer";
import { getIframeDoc } from "../../utils/serviceUtils/docUtil";
import { tsTransform } from "../../utils/serviceUtils/langUtil";
import { binicReadingProcess } from "../../utils/serviceUtils/bionicUtil";
import PopupBox from "../../components/popups/popupBox";
import { renderHighlighters } from "../../utils/serviceUtils/noteUtil";
import Note from "../../models/Note";
import PageWidget from "../../pages/pageWidget";
import { scrollContents, formatDuration } from "../../utils/commonUtil";
import ReadingTime from "../../utils/readUtils/readingTime";
import api from "../../utils/axios";
import authService, { UserData } from "../../utils/authService";

declare var window: any;
let lock = false; //prevent from clicking too fasts

const Viewer: React.FC<ViewerProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const user_ic = userData?.ic_number;

  // State management using useState hooks
  const [cfiRange, setCfiRange] = useState<any>(null);
  const [contents, setContents] = useState<any>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [key, setKey] = useState("");
  const [isFirst, setIsFirst] = useState(true);
  const [scale, setScale] = useState(StorageUtil.getReaderConfig("scale") || 1);
  const [chapterTitle, setChapterTitle] = useState(
    RecordLocation.getHtmlLocation(props.currentBook.key).chapterTitle || ""
  );
  const [readerMode, setReaderMode] = useState(StorageUtil.getReaderConfig("readerMode") || "double");
  const [isDisablePopup, setIsDisablePopup] = useState(StorageUtil.getReaderConfig("isDisablePopup") === "yes");
  const [isTouch, setIsTouch] = useState(StorageUtil.getReaderConfig("isTouch") === "yes");
  const [margin, setMargin] = useState(parseInt(StorageUtil.getReaderConfig("margin")) || 0);
  const [chapterDocIndex, setChapterDocIndex] = useState(
    parseInt(RecordLocation.getHtmlLocation(props.currentBook.key).chapterDocIndex || "0")
  );
  const [pageOffset, setPageOffset] = useState("");
  const [pageWidth, setPageWidth] = useState("");
  const [chapter, setChapter] = useState("");
  const [rendition, setRendition] = useState<any>(null);
  const [startedTime, setStartedTime] = useState(new Date().toISOString());
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState("0");
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);

  // Refs for cleanup
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lockRef = useRef(false);

  // Event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isCtrlP = event.ctrlKey && event.key === "p";
    const isCmdP = event.metaKey && event.key === "p"; // For macOS

    if (isCtrlP || isCmdP) {
      event.preventDefault();
      console.log("Print dialog disabled");
    }
  }, []);

  const handleQuizModal = useCallback(() => {
    setShowModal(prev => !prev);
  }, []);

  const handleScore = useCallback((newScore: string) => {
    setScore(newScore);
  }, []);

  const handleChatCollapse = useCallback(() => {
    setIsChatCollapsed(prev => !prev);
  }, []);


  // Effects
  useEffect(() => {
    // Equivalent to UNSAFE_componentWillMount
    props.handleFetchBookmarks();
    props.handleFetchNotes();
    props.handleFetchBooks();
  }, [props.handleFetchBookmarks, props.handleFetchNotes, props.handleFetchBooks]);

  useEffect(() => {
    // Equivalent to componentDidMount
    window.rangy.init();
    handleRenderBook();
    //make sure page width is always 12 times, section = Math.floor(element.clientWidth / 12), or text will be blocked
    handlePageWidth();
    props.handleRenderBookFunc(handleRenderBook);

    window.addEventListener("resize", () => {
      BookUtil.reloadBooks();
    });

    // Cleanup function
    return () => {
      window.removeEventListener("resize", () => {
        BookUtil.reloadBooks();
      });
    };
  }, [props.handleRenderBookFunc]);

  const handlePageWidth = useCallback(() => {
    const findValidMultiple = (limit: number) => {
      let multiple = limit - (limit % 12);

      while (multiple >= 0) {
        if (((multiple - multiple / 12) / 2) % 2 === 0) {
          return multiple;
        }
        multiple -= 12;
      }

      return limit;
    };

    if (document.body.clientWidth < 570) {
      let width = findValidMultiple(document.body.clientWidth - 72);

      setPageOffset(`calc(50vw - ${width / 2}px)`);
      setPageWidth(`${width}px`);
    } else if (readerMode === "scroll") {
      let width = findValidMultiple(276 * parseFloat(scale) * 2);
      setPageOffset(`calc(50vw - ${width / 2}px)`);
      setPageWidth(`${width}px`);
    } else if (readerMode === "single") {
      let width = findValidMultiple(
        276 * parseFloat(scale) * 2 - 36
      );
      setPageOffset(`calc(50vw - ${width / 2}px)`);
      setPageWidth(`${width}px`);
    } else if (readerMode === "double") {
      let width = findValidMultiple(
        document.body.clientWidth - 2 * margin - 80
      );
      setPageOffset(`calc(50vw - ${width / 2}px)`);
      setPageWidth(`${width}px`);
    }
  }, [readerMode, scale, margin]);

  const handleHighlight = useCallback((rendition: any) => {
    let highlighters: any = props.notes;
    if (!highlighters) return;
    let highlightersByChapter = highlighters.filter((item: Note) => {
      return (
        (item.chapter ===
          rendition.getChapterDoc()[chapterDocIndex].label ||
          item.chapterIndex === chapterDocIndex) &&
        item.bookKey === props.currentBook.key
      );
    });

    renderHighlighters(
      highlightersByChapter,
      props.currentBook.format,
      handleNoteClick
    );
  }, [props.notes, chapterDocIndex, props.currentBook.key, props.currentBook.format]);

  const handleNoteClick = useCallback((event: Event) => {
    props.handleNoteKey((event.target as any).dataset.key);
    props.handleMenuMode("note");
    props.handleOpenMenu(true);
  }, [props.handleNoteKey, props.handleMenuMode, props.handleOpenMenu]);

  const handleLocation = useCallback(() => {
    if (!props.htmlBook) {
      return;
    }
    let position = props.htmlBook.rendition.getPosition();
    RecordLocation.recordHtmlLocation(
      props.currentBook.key,
      position.text,
      position.chapterTitle,
      position.chapterDocIndex,
      position.chapterHref,
      position.count,
      position.percentage,
      position.cfi,
      position.page
    );
  }, [props.htmlBook, props.currentBook.key]);

  const handleBindGesture = useCallback(() => {
    let doc = getIframeDoc();
    if (!doc) return;
    doc.addEventListener("click", (event) => {
      props.handleLeaveReader("left");
      props.handleLeaveReader("right");
      props.handleLeaveReader("top");
      props.handleLeaveReader("bottom");
    });
    doc.addEventListener("mouseup", () => {
      if (isDisablePopup) {
        if (doc!.getSelection()!.toString().trim().length === 0) {
          let rect = doc!.getSelection()!.getRangeAt(0).getBoundingClientRect();
          setRect(rect);
        }
      }
      if (isDisablePopup) return;

      var rect = doc!.getSelection()!.getRangeAt(0).getBoundingClientRect();
      setRect(rect);
    });
    doc.addEventListener("contextmenu", (event) => {
      if (document.location.href.indexOf("localhost") === -1) {
        event.preventDefault();
      }

      if (!isDisablePopup && !isTouch) return;

      if (
        !doc!.getSelection() ||
        doc!.getSelection()!.toString().trim().length === 0
      )
        return;
      var rect = doc!.getSelection()!.getRangeAt(0).getBoundingClientRect();
      console.log(rect);
      setRect(rect);
    });
  }, [props.handleLeaveReader, isDisablePopup, isTouch]);

  const handleRenderBook = useCallback(async () => {
    if (lockRef.current) return;
    let { key, path, format, name } = props.currentBook;
    console.log("===== currentBook", props.currentBook);
    props.handleHtmlBook(null);
    let doc = getIframeDoc();
    if (doc && rendition) {
      rendition.removeContent();
    }
    let isCacheExsit = await BookUtil.isBookExist("cache-" + key, path);
    BookUtil.fetchBook(isCacheExsit ? "cache-" + key : key, true, path).then(
      async (result: any) => {
        if (!result) {
          toast.error(props.t("Book not exsit"));
          return;
        }
        let newRendition = BookUtil.getRendtion(
          result,
          isCacheExsit ? "CACHE" : format,
          readerMode,
          props.currentBook.charset,
          StorageUtil.getReaderConfig("isSliding") === "yes" ? "sliding" : ""
        );

        await newRendition.renderTo(
          document.getElementsByClassName("html-viewer-page")[0]
        );
        await handleRest(newRendition);
        props.handleReadingState(true);

        RecentBooks.setRecent(props.currentBook.key);
        document.title = name + " - AI eBook Library Tanjong Piai";
      }
    );
  }, [props, rendition, readerMode]);

  const handleRest = useCallback(async (newRendition: any) => {
    HtmlMouseEvent(
      newRendition,
      props.currentBook.key,
      readerMode
    );
    let chapters = newRendition.getChapter();
    let chapterDocs = newRendition.getChapterDoc();
    let flattenChapters = newRendition.flatChapter(chapters);
    props.handleHtmlBook({
      key: props.currentBook.key,
      chapters,
      flattenChapters,
      rendition: newRendition,
    });
    setRendition(newRendition);

    StyleUtil.addDefaultCss();
    tsTransform();
    binicReadingProcess();
    // newRendition.setStyle(StyleUtil.getCustomCss());
    let bookLocation: {
      text: string;
      count: string;
      chapterTitle: string;
      chapterDocIndex: string;
      chapterHref: string;
      percentage: string;
      cfi: string;
      page: string;
    } = RecordLocation.getHtmlLocation(props.currentBook.key);
    if (chapterDocs.length > 0) {
      await newRendition.goToPosition(
        JSON.stringify({
          text: bookLocation.text || "",
          chapterTitle: bookLocation.chapterTitle || chapterDocs[0].label,
          page: bookLocation.page || "",
          chapterDocIndex: bookLocation.chapterDocIndex || 0,
          chapterHref: bookLocation.chapterHref || chapterDocs[0].href,
          count: bookLocation.hasOwnProperty("cfi")
            ? "ignore"
            : bookLocation.count || 0,
          percentage: bookLocation.percentage,
          cfi: bookLocation.cfi,
          isFirst: true,
        })
      );
    }

    newRendition.on("rendered", () => {
      handleLocation();
      let bookLocation: {
        text: string;
        count: string;
        chapterTitle: string;
        chapterDocIndex: string;
        chapterHref: string;
      } = RecordLocation.getHtmlLocation(props.currentBook.key);

      let chapter =
        bookLocation.chapterTitle ||
        (props.htmlBook && props.htmlBook.flattenChapters[0]
          ? props.htmlBook.flattenChapters[0].label
          : "Unknown chapter");
      let newChapterDocIndex = 0;
      if (bookLocation.chapterDocIndex) {
        newChapterDocIndex = parseInt(bookLocation.chapterDocIndex);
      } else {
        newChapterDocIndex =
          bookLocation.chapterTitle && props.htmlBook
            ? window._.findLastIndex(
                props.htmlBook.flattenChapters.map((item) => {
                  item.label = item.label.trim();
                  return item;
                }),
                {
                  title: bookLocation.chapterTitle.trim(),
                }
              )
            : 0;
      }
      props.handleCurrentChapter(chapter);
      props.handleCurrentChapterIndex(newChapterDocIndex);
      props.handleFetchPercentage(props.currentBook);
      setChapter(chapter);
      setChapterDocIndex(newChapterDocIndex);
      scrollContents(chapter, bookLocation.chapterHref);
      StyleUtil.addDefaultCss();
      tsTransform();
      binicReadingProcess();
      handleBindGesture();
      handleHighlight(newRendition);
      lockRef.current = true;
      setTimeout(function () {
        lockRef.current = false;
      }, 1000);
      return false;
    });
  }, [props, readerMode, handleLocation, handleBindGesture, handleHighlight]);

  const openAiChat = useCallback(() => {
    props.handleMenuMode("ai-chat");
    props.handleOpenMenu(true);
  }, [props.handleMenuMode, props.handleOpenMenu]);

  // Separate effect for duration tracking - runs when book is loaded
  useEffect(() => {
    if (!props.currentBook.key) return;

    // Clear any existing interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    // Set up duration interval
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        // Save to localStorage every second
        ReadingTime.setTime(props.currentBook.key, newDuration);
        console.log('Duration updated:', newDuration, 'seconds');
        return newDuration;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [props.currentBook.key]);

  // Separate effect to handle duration cleanup on unmount
  useEffect(() => {
    return () => {
      // Save duration when component unmounts
      if (props.currentBook.key && duration > 0) {
        ReadingTime.setTime(props.currentBook.key, duration);
      }
    };
  }, [props.currentBook.key, duration]);

  // Effect for beforeunload to save reading progress
  useEffect(() => {
    const beforeUnloadHandler = async (e: BeforeUnloadEvent) => {
      e.preventDefault();

      const book = props.currentBook;
      if (
        RecordLocation.getHtmlLocation(book.key) &&
        RecordLocation.getHtmlLocation(book.key).percentage &&
        book.key
      ) {
        let percentage = RecordLocation.getHtmlLocation(book.key).percentage || "0";

        // Save final duration to localStorage
        if (book.key) {
          ReadingTime.setTime(book.key, duration);
        }

        // Save reading progress to API
        try {
          await api.post(`/api/ebooks/reading_progress/add`, {
            user_ic: user_ic,
            book_id: book.key,
            percentage: percentage,
            started_time: startedTime,
            duration: duration,
            score: score,
          });
        } catch (error) {
          console.error("Failed to save reading progress:", error);
        }
      }

      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.currentBook, duration, startedTime, score, user_ic, handleKeyDown]);

  return (
    <>
      {/* Reading Time Display */}
      <div className="fixed top-4 right-4 z-40 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
          <span className="text-sm font-medium">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {props.htmlBook ? (
        <PopupMenu
          {...{
            rendition: props.htmlBook.rendition,
            rect: rect,
            chapterDocIndex: chapterDocIndex,
            chapter: chapter,
          }}
        />
      ) : null}
      {props.isOpenMenu &&
      props.htmlBook &&
      (props.menuMode === "dict" ||
        props.menuMode === "trans" ||
        props.menuMode === "note" ||
        props.menuMode === "ai-chat") ? (
        <PopupBox
          {...{
            rendition: props.htmlBook.rendition,
            rect: rect,
            chapterDocIndex: chapterDocIndex,
            chapter: chapter,
          }}
        />
      ) : null}
      {props.htmlBook && (
        <ImageViewer
          {...{
            isShow: props.isShow,
            rendition: props.htmlBook.rendition,
            handleEnterReader: props.handleEnterReader,
            handleLeaveReader: props.handleLeaveReader,
          }}
        />
      )}
      <button
        className="ai-chat-button"
        onClick={openAiChat}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 9999,
          padding: "10px 15px",
          background: "#109870",
          color: "#fff",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        AI Chat
      </button>
      <div
        className={
          readerMode === "scroll"
            ? "html-viewer-page scrolling-html-viewer-page"
            : "html-viewer-page"
        }
        id="page-area"
        style={
          readerMode === "scroll" &&
          document.body.clientWidth >= 570
            ? {
                marginLeft: pageOffset,
                marginRight: pageOffset,
                paddingLeft: "20px",
                paddingRight: "15px",
                left: 0,
                right: 0,
              }
            : {
                left: pageOffset,
                width: pageWidth,
              }
        }
      ></div>
      <PageWidget />
      {StorageUtil.getReaderConfig("isHideBackground") === "yes" ? null : props
          .currentBook.key ? (
        <Background />
      ) : null}
    </>
  );
};

export default withRouter(Viewer as any);
