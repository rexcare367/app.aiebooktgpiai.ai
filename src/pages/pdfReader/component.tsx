import React, { useCallback, useEffect, useState, useRef } from "react";
import RecentBooks from "../../utils/readUtils/recordRecent";
import { ViewerProps, ViewerState } from "./interface";
import { Tooltip } from "react-tooltip";
import { withRouter } from "react-router-dom";
import BookUtil from "../../utils/fileUtils/bookUtil";
import PDFWidget from "../../components/pdfWidget";
import PopupMenu from "../../components/popups/popupMenu";
import { Toaster } from "react-hot-toast";
import { handleLinkJump } from "../../utils/readUtils/linkUtil";
import { pdfMouseEvent } from "../../utils/serviceUtils/mouseEvent";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import PopupBox from "../../components/popups/popupBox";
import { renderHighlighters } from "../../utils/serviceUtils/noteUtil";
import { getPDFIframeDoc } from "../../utils/serviceUtils/docUtil";
import Note from "../../models/Note";
import RecordLocation from "../../utils/readUtils/recordLocation";
import ReadingTime from "../../utils/readUtils/readingTime";
import api from "../../utils/axios";
import EbookChatbotWidget from "../../components/dialogs/ebookChatbotDialog/ebookChatbotWidget";
import authService, { UserData } from "../../utils/authService";
import { formatDuration } from "../../utils/commonUtil";
import QuizModal from "../../components/dialogs/quizModal/QuizModal";

// (Inline quiz modal removed; using external QuizModal component.)

declare var window: any;

const Viewer: React.FC<ViewerProps> = (props) => {
  
  const userData: UserData | null = authService.getUserData();
  // const userId = userData?.id;
  const user_ic = userData?.ic_number;

  // State management using useState hooks
  const [href, setHref] = useState("");
  const [title, setTitle] = useState("");
  const [rect, setRect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapterDocIndex, setChapterDocIndex] = useState(
    parseInt(RecordLocation.getHtmlLocation(props.currentBook.key).chapterDocIndex || "0")
  );
  const [isDisablePopup, setIsDisablePopup] = useState(StorageUtil.getReaderConfig("isDisablePopup") === "yes");
  const [isTouch, setIsTouch] = useState(StorageUtil.getReaderConfig("isTouch") === "yes");
  const [startedTime, setStartedTime] = useState(new Date().toISOString());
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState("0");
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);

  // Refs for cleanup
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to save reading progress
  const saveReadingProgress = useCallback(async (useBeacon = false) => {
    const book = props.currentBook;
    if (
      !book.key ||
      !RecordLocation.getPDFLocation(book.md5.split("-")[0]) ||
      !RecordLocation.getPDFLocation(book.md5.split("-")[0]).page ||
      !book.page
    ) {
      return;
    }

    const percentage = RecordLocation.getPDFLocation(book.md5.split("-")[0]).page / book.page;
    
    // Get auth token for sendBeacon
    const token = localStorage.getItem("auth_token");
    
    const data = {
      user_ic: user_ic,
      book_id: book.key,
      percentage: percentage.toString(),
      started_time: startedTime,
      duration: duration,
      score: score,
      auth_token: token, // Include token in body for sendBeacon
    };

    if (useBeacon && navigator.sendBeacon) {
      // Use sendBeacon for reliable submission on page unload
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const baseURL = api.defaults.baseURL || "http://localhost:8000";
      navigator.sendBeacon(`${baseURL}/api/ebooks/reading_progress/add`, blob);
      console.log('Reading progress sent via beacon');
    } else {
      // Use regular API call for periodic saves
      try {
        await api.post(`/api/ebooks/reading_progress/add`, data);
        console.log('Reading progress saved successfully');
      } catch (error) {
        console.error('Failed to save reading progress:', error);
      }
    }
  }, [props.currentBook, user_ic, startedTime, duration, score]);

  // Event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isCtrlP = event.ctrlKey && event.key === "p";
    const isCmdP = event.metaKey && event.key === "p"; // For macOS

    if (isCtrlP || isCmdP) {
      event.preventDefault();
      console.log("Print dialog disabled");
    }
  }, []);

  const handleHighlight = useCallback(() => {
    let highlighters: any = props.notes;
    if (!highlighters) return;
    let highlightersByChapter = highlighters.filter((item: Note) => {
      return item.chapterIndex === chapterDocIndex && item.bookKey === props.currentBook.key;
    });
    renderHighlighters(highlightersByChapter, props.currentBook.format, handleNoteClick);
  }, [props.notes, chapterDocIndex, props.currentBook.key, props.currentBook.format]);

  const handleNoteClick = useCallback((event: Event) => {
    props.handleNoteKey((event.target as any).dataset.key);
    props.handleMenuMode("note");
    props.handleOpenMenu(true);
  }, [props.handleNoteKey, props.handleMenuMode, props.handleOpenMenu]);

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
    let url = document.location.href;
    let firstIndexOfQuestion = url.indexOf("?");
    let lastIndexOfSlash = url.lastIndexOf("/", firstIndexOfQuestion);
    let key = url.substring(lastIndexOfSlash + 1, firstIndexOfQuestion);

    window.localforage.getItem("books").then((result: any) => {
      let book = result[window._.findIndex(result, { key })] || JSON.parse(localStorage.getItem("tempBook") || "{}");

      document.title = book.name + " - AI eBook Library Tanjong Piai";
      props.handleReadingState(true);
      RecentBooks.setRecent(key);
      props.handleReadingBook(book);
      setTitle(book.name + " - AI eBook Library Tanjong Piai");
      setHref(BookUtil.getPDFUrl(book));

      // Duration loading is now handled in the book change effect
    });

    document.querySelector(".ebook-viewer")?.setAttribute("style", "height:100%; overflow: hidden;");
    let pageArea = document.getElementById("page-area");
    if (!pageArea) return;
    let iframe = pageArea.getElementsByTagName("iframe")[0];
    if (!iframe) return;

    iframe.onload = () => {
      let doc: any = iframe.contentWindow || iframe.contentDocument?.defaultView;
      setLoading(false);
      pdfMouseEvent();

      doc.document.addEventListener("click", async (event: any) => {
        event.preventDefault();
        await handleLinkJump(event);
      });

      doc.document.addEventListener("mouseup", (event) => {
        if (!doc.getSelection() || doc.getSelection().rangeCount === 0) return;

        if (isDisablePopup) {
          if (doc.getSelection().toString().trim().length === 0) {
            let rect = doc.getSelection().getRangeAt(0).getBoundingClientRect();
            setRect(rect);
          }
        }
        if (isDisablePopup) return;
        event.preventDefault();
        var rect = doc.getSelection().getRangeAt(0).getBoundingClientRect();
        setRect(rect);
      });

      doc.addEventListener("contextmenu", (event) => {
        if (document.location.href.indexOf("localhost") === -1) {
          event.preventDefault();
        }

        if (!isDisablePopup && !isTouch) return;
        if (!doc!.getSelection() || doc!.getSelection().toString().trim().length === 0) return;

        var rect = doc!.getSelection()!.getRangeAt(0).getBoundingClientRect();
        setRect(rect);
      });

      setTimeout(() => {
        handleHighlight();
        let iWin = getPDFIframeDoc();
        if (!iWin) return;
        if (!iWin.PDFViewerApplication.eventBus) return;
        iWin.PDFViewerApplication.eventBus.on("pagechanging", (event: any) => {
          const currentPage = event.pageNumber;
          const totalPages = iWin.PDFViewerApplication.pagesCount;
          if (currentPage === totalPages) {
            setShowModal(true);
          }
        });
      }, 3000);
    };

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      // Use sendBeacon for reliable data submission on page unload
      saveReadingProgress(true);
    };

    const visibilityChangeHandler = () => {
      if (document.hidden) {
        // Page is being hidden, save progress
        saveReadingProgress(true);
      }
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    // window.addEventListener("visibilitychange", visibilityChangeHandler);
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      // window.removeEventListener("visibilitychange", visibilityChangeHandler);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props, isDisablePopup, isTouch, handleHighlight, handleKeyDown, startedTime, score, saveReadingProgress]);

  // Effect to reset duration when book changes and load existing time for current book
  useEffect(() => {
    if (!props.currentBook.key) return;

    // Reset duration to 0 when switching books, then load existing time for current book
    setDuration(0);
  }, [props.currentBook.key]);

  // Separate effect for duration tracking - runs when book is loaded
  useEffect(() => {
    if (!props.currentBook.key) return;

    // Clear any existing interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
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
        durationIntervalRef.current = null;
      }
    };
  }, [props.currentBook.key]);

  // Effect to save duration when it changes
  useEffect(() => {
    if (props.currentBook.key && duration > 0) {
      ReadingTime.setTime(props.currentBook.key, duration);
    }
  }, [props.currentBook.key, duration]);

  // Effect to handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Final cleanup - clear interval and save duration
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // Save final duration when component unmounts
      if (props.currentBook.key && duration > 0) {
        ReadingTime.setTime(props.currentBook.key, duration);
      }
    };
  }, []);

  // Effect for periodic saving of reading progress (every 30 seconds)
  useEffect(() => {
    if (!props.currentBook.key) return;

    // Clear any existing interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }

    // Set up periodic save interval (every 30 seconds)
    saveIntervalRef.current = setInterval(() => {
      saveReadingProgress(false);
    }, 30000);

    // Cleanup function
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [props.currentBook.key, saveReadingProgress]);

  return (
    <div className="ebook-viewer" id="page-area">
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

      {/* Collapsible Chatbot */}
      <div className="fixed z-50 flex flex-col items-end bottom-4 right-4">
        <button
          onClick={handleChatCollapse}
          className="p-2 mb-2 text-white bg-gray-700 rounded-full shadow-lg hover:bg-gray-600"
        >
          {isChatCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </button>
        {!isChatCollapsed && (
          <EbookChatbotWidget
            customStyle={{
              chat: {
                width: "350px",
                height: "500px",
                position: "fixed",
                right: "10px",
                top: "440px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                zIndex: 1000,
              },
              "message-header": {
                backgroundColor: "#4a5568",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              },
              messages: {
                height: "calc(500px - 120px)",
                backgroundColor: "#ffffff",
              },
            }}
            currentTitle={props.currentBook.file_key}
          />
        )}
      </div>

      <QuizModal
        show={showModal}
        onClose={handleQuizModal}
        book={props.currentBook}
        onScore={handleScore}
      />

      <Tooltip id="my-tooltip" style={{ zIndex: 25 }} />

      {!loading && (
        <PopupMenu
          {...{
            rendition: {
              on: (status: string, callback: any) => {
                callback();
              },
            },
            rect: rect,
            chapterDocIndex: 0,
            chapter: "0",
          }}
        />
      )}

      {props.isOpenMenu &&
      (props.menuMode === "dict" ||
        props.menuMode === "trans" ||
        props.menuMode === "note" ||
        props.menuMode === "ai-chat") ? (
        <PopupBox
          {...{
            rendition: {
              on: (status: string, callback: any) => {
                callback();
              },
            },
            rect: rect,
            chapterDocIndex: 0,
            chapter: "0",
          }}
        />
      ) : null}

      <iframe src={href} title={title} width="100%" height="100%">
        Loading
      </iframe>

      <PDFWidget />
      <Toaster />
    </div>
  );
};

export default withRouter(Viewer as any);
