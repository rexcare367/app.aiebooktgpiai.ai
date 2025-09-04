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
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import "./book-quiz-modal.css";
import Loading from "../../components/loading/component";
import api from "../../utils/axios";
import EbookChatbotWidget from "../../components/dialogs/ebookChatbotDialog/ebookChatbotWidget";
import authService, { UserData } from "../../utils/authService";
import { formatDuration } from "../../utils/commonUtil";

function RenderQuizModal({ showModal, handleQuizModal, book, handleScore }) {
  const [quizzes, setQuizzes] = useState([{ question: "", answer: [], id: "" }]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState("0");
  const [step, setStep] = useState<"question" | "result">("question");
  // const userId = useCurrentUserId();
  const userData: UserData | null = authService.getUserData();
  // const userId = userData?.id;
  const user_ic = userData?.ic_number;

  const generateQuiz = useCallback(async () => {
    await api
      .post(`/api/ebooks/generate-quiz`, {
        book_id: book.key,
        user_ic: user_ic,
      })
      .then((res) => {
        const _quizzes = res.data.quizzes;
        setQuizzes(_quizzes);
      });
  }, [book.key]);

  useEffect(() => {
    if (book.file_key && showModal) {
      setLoading(true);
      generateQuiz().then((response) => {
        console.log("response", response);

        setLoading(false);
      });
    }
  }, [showModal, book, generateQuiz]);

  const submitAnswer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const selectedAnswers = quizzes.map((_, i) => {
      return { quizId: _.id, answer: formData.get(`quiz-${i}`) };
    });

    try {
      const attributes = await api
        .post(`/api/ebooks/submit-answer`, {
          answers: selectedAnswers,
        })
        .then((res) => {
          setScore(res.data.score);
          handleScore(res.data.score);
          setStep("result");
          toast.success("Update successful");
        })
        .catch((error) => {
          toast.error(error.message);
        });
      console.log("===== updated attributes", attributes);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="star-background">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                className="star"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {step === "result" ? (
            <>
              <h2 className="modal-title">Quiz Result</h2>
              <div className="modal-body result">
                {parseFloat(score) > 2 ? (
                  <>
                    <div className="result-icon correct">✓</div>
                    <p className="result-text correct">Awesome Job!</p>
                    <p className="result-subtext">
                      Your score is <span className="score"> {score} </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="result-icon incorrect">✗</div>
                    <p className="result-text incorrect">Nice Try!</p>
                    <p className="result-subtext">You answered {score} questions correctly</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="button primary" onClick={() => handleQuizModal()}>
                  Continue Adventure!
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submitAnswer}>
              <h2 className="modal-title">Congratulations, Star Reader!</h2>
              <div className="modal-body">
                <p className="subtitle">You've finished the book! Ready for a fun challenge?</p>
                {loading ? (
                  <Loading width="[100vw]" height="[100vh]" />
                ) : (
                  <fieldset>
                    {quizzes.map((quiz, i) => {
                      return (
                        <div key={i}>
                          <p className="question">
                            {i + 1}. {quiz.question}
                          </p>
                          <div className="options">
                            {quiz.answer.map((answer, j) => {
                              return (
                                <label key={j} className="option">
                                  <input
                                    className="w-4 min-w-4"
                                    type="radio"
                                    name={`quiz-${i}`}
                                    value={`${j}`}
                                    id={`answer-${j}`}
                                  />
                                  <span className="option-text">{answer}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </fieldset>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="button secondary"
                  onClick={() => {
                    handleQuizModal();
                    setStep("question");
                  }}
                >
                  Maybe Later
                </button>
                <button className="text-white button primary" type="submit" disabled={loading}>
                  Let's Go!
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  );
}

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

      // Load existing reading time from localStorage
      const existingTime = ReadingTime.getTime(book.key) || 0;
      setDuration(existingTime);
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

    const beforeUnloadHandler = async (e: BeforeUnloadEvent) => {
      e.preventDefault();

      const book = props.currentBook;
      if (
        RecordLocation.getPDFLocation(book.md5.split("-")[0]) &&
        RecordLocation.getPDFLocation(book.md5.split("-")[0]).page &&
        book.page
      ) {
        let percentage = RecordLocation.getPDFLocation(book.md5.split("-")[0]).page / book.page + "";

        // Save final duration to localStorage
        if (book.key) {
          ReadingTime.setTime(book.key, duration);
        }

        // Get user ID from Clerk - this will need to be passed down from parent component
        api.post(`/api/ebooks/reading_progress/add`, {
          user_ic: user_ic,
          book_id: book.key,
          percentage: percentage,
          started_time: startedTime,
          duration: duration,
          score: score,
        });
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
  }, [props, isDisablePopup, isTouch, handleHighlight, handleKeyDown, startedTime, score]);

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

      <RenderQuizModal
        showModal={showModal}
        handleQuizModal={handleQuizModal}
        book={props.currentBook}
        handleScore={handleScore}
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
