import React, { useCallback, useEffect, useState } from "react";
import SettingPanel from "../../containers/panels/settingPanel";
import NavigationPanel from "../../containers/panels/navigationPanel";
// import OperationPanel from "../../containers/panels/operationPanel";
import { Toaster } from "react-hot-toast";
import ProgressPanel from "../../containers/panels/progressPanel";
import { ReaderProps, ReaderState } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import ReadingTime from "../../utils/readUtils/readingTime";
import Viewer from "../../containers/htmlViewer";
import { Tooltip } from "react-tooltip";
import RecordLocation from "../../utils/readUtils/recordLocation";
import toast from "react-hot-toast";
import "./index.css";

import { Star } from "lucide-react";
import EbookChatbotWidget from "../../components/dialogs/ebookChatbotDialog/ebookChatbotWidget";
import Loading from "../../components/loading/component";
import api from "../../utils/axios";
import { getCurrentUser } from "aws-amplify/auth";

function RenderQuizModal({ showModal, handleQuizModal, book, handleScore }) {
  const [quizzes, setQuizzes] = useState([{ question: "", answer: [], id: "" }]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState("0");
  const [step, setStep] = useState<"question" | "result">("question");

  const generateQuiz = useCallback(async () => {
    const { username } = await getCurrentUser();
    await api
      .post(`/api/ebooks/generate-quiz`, {
        book_id: book.key,
        user_ic: username,
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
                    <p className="result-subtext">Your score is {score}</p>
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

let lock = false; //prevent from clicking too fasts
let throttleTime = StorageUtil.getReaderConfig("isSliding") === "yes" ? 1000 : 200;
class Reader extends React.Component<ReaderProps, ReaderState> {
  messageTimer!: NodeJS.Timeout;
  tickTimer!: NodeJS.Timeout;
  constructor(props: ReaderProps) {
    super(props);
    this.state = {
      isOpenRightPanel: StorageUtil.getReaderConfig("isSettingLocked") === "yes" ? true : false,
      isOpenTopPanel: false,
      isOpenBottomPanel: false,
      hoverPanel: "",
      isOpenLeftPanel: StorageUtil.getReaderConfig("isNavLocked") === "yes" ? true : false,
      time: 0,
      isTouch: StorageUtil.getReaderConfig("isTouch") === "yes",
      isPreventTrigger: StorageUtil.getReaderConfig("isPreventTrigger") === "yes",
      started_time: new Date().toISOString(),
      duration: 0,
      showModal: false,
      score: "0",
      isChatCollapsed: true,
    };
  }
  componentDidMount() {
    if (StorageUtil.getReaderConfig("isMergeWord") === "yes") {
      document.querySelector("body")?.setAttribute("style", "background-color: rgba(0,0,0,0)");
    }
    let time = ReadingTime.getTime(this.props.currentBook.key) || 0;
    this.tickTimer = setInterval(() => {
      if (this.props.currentBook.key) {
        time += 1;
        this.setState({ time });
        ReadingTime.setTime(this.props.currentBook.key, time);
      }
    }, 1000);

    window.addEventListener("beforeunload", async (e) => {
      e.preventDefault();

      const book = this.props.currentBook;
      if (RecordLocation.getHtmlLocation(book.key) && RecordLocation.getHtmlLocation(book.key).percentage) {
        let percentage = RecordLocation.getHtmlLocation(book.key).percentage;
        const { username } = await getCurrentUser();

        api.post(`/api/ebooks/reading_progress/add`, {
          user_ic: username,
          book_id: book.key,
          percentage: percentage,
          started_time: this.state.started_time,
          duration: time,
          score: this.state.score,
        });
      }

      e.returnValue = "";
    });
    window.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
  UNSAFE_componentWillMount() {
    let url = document.location.href;
    let firstIndexOfQuestion = url.indexOf("?");
    let lastIndexOfSlash = url.lastIndexOf("/", firstIndexOfQuestion);
    let key = url.substring(lastIndexOfSlash + 1, firstIndexOfQuestion);
    this.props.handleFetchBooks();
    window.localforage.getItem("books").then((result: any) => {
      let book = result[window._.findIndex(result, { key })] || JSON.parse(localStorage.getItem("tempBook") || "{}");

      this.props.handleReadingBook(book);
      this.props.handleFetchPercentage(book);
    });
  }

  handleKeyDown = (event) => {
    const isCtrlP = event.ctrlKey && event.key === "p";
    const isCmdP = event.metaKey && event.key === "p"; // For macOS

    if (isCtrlP || isCmdP) {
      event.preventDefault();
      console.log("Print dialog disabled");
    }
  };

  handleEnterReader = (position: string) => {
    switch (position) {
      case "right":
        this.setState({
          isOpenRightPanel: this.state.isOpenRightPanel ? false : true,
        });
        break;
      case "left":
        this.setState({
          isOpenLeftPanel: this.state.isOpenLeftPanel ? false : true,
        });
        break;
      case "top":
        this.setState({
          isOpenTopPanel: this.state.isOpenTopPanel ? false : true,
        });
        break;
      case "bottom":
        this.setState({
          isOpenBottomPanel: this.state.isOpenBottomPanel ? false : true,
        });
        break;
      default:
        break;
    }
  };
  handleLeaveReader = (position: string) => {
    switch (position) {
      case "right":
        if (StorageUtil.getReaderConfig("isSettingLocked") === "yes") {
          break;
        } else {
          this.setState({ isOpenRightPanel: false });
          break;
        }

      case "left":
        if (StorageUtil.getReaderConfig("isNavLocked") === "yes") {
          break;
        } else {
          this.setState({ isOpenLeftPanel: false });
          break;
        }
      case "top":
        this.setState({ isOpenTopPanel: false });
        break;
      case "bottom":
        this.setState({ isOpenBottomPanel: false });
        break;
      default:
        break;
    }
  };
  handleLocation = () => {
    let position = this.props.htmlBook.rendition.getPosition();

    RecordLocation.recordHtmlLocation(
      this.props.currentBook.key,
      position.text,
      position.chapterTitle,
      position.chapterDocIndex,
      position.chapterHref,
      position.count,
      position.percentage,
      position.cfi,
      position.page
    );

    // Check if the current page is the last page
    // const totalPages = this.props.htmlBook.rendition.totalPages; // Assuming totalPages is available
    if (position.percentage === "1") {
      this.setState({ showModal: true }); // Show the modal when reaching the last page
    }
  };
  handleQuizModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  handleScore = (score: string) => {
    this.setState({ score });
  };

  handleChatCollapse = () => {
    this.setState((prevState) => ({
      ...prevState,
      isChatCollapsed: !prevState.isChatCollapsed,
    }));
  };
  render() {
    const renditionProps = {
      handleLeaveReader: this.handleLeaveReader,
      handleEnterReader: this.handleEnterReader,
      isShow:
        this.state.isOpenLeftPanel ||
        this.state.isOpenTopPanel ||
        this.state.isOpenBottomPanel ||
        this.state.isOpenRightPanel,
    };
    return (
      <div className="viewer">
        {/* Collapsible Chatbot */}
        <div className="fixed z-50 flex flex-col items-end bottom-14 right-5">
          <button
            onClick={this.handleChatCollapse}
            className="p-2 mb-2 text-white bg-gray-700 rounded-full shadow-lg hover:bg-gray-600"
          >
            {this.state.isChatCollapsed ? (
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
          {!this.state.isChatCollapsed && (
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
              currentTitle={this.props.currentBook.file_key}
            />
          )}
        </div>

        <RenderQuizModal
          showModal={this.state.showModal}
          handleQuizModal={this.handleQuizModal}
          book={this.props.currentBook}
          handleScore={this.handleScore}
        />
        <Tooltip id="my-tooltip" style={{ zIndex: 25 }} />
        {StorageUtil.getReaderConfig("isHidePageButton") !== "yes" && (
          <>
            <div
              className="previous-chapter-single-container"
              onClick={async () => {
                if (lock) return;
                lock = true;
                await this.props.htmlBook.rendition.prev();
                this.handleLocation();
                setTimeout(() => (lock = false), throttleTime);
              }}
            >
              <span className="icon-dropdown previous-chapter-single"></span>
            </div>
            <div
              className="next-chapter-single-container"
              onClick={async () => {
                if (lock) return;
                lock = true;
                await this.props.htmlBook.rendition.next();
                this.handleLocation();
                setTimeout(() => (lock = false), throttleTime);
              }}
            >
              <span className="icon-dropdown next-chapter-single"></span>
            </div>
          </>
        )}
        {StorageUtil.getReaderConfig("isHideMenuButton") !== "yes" && (
          <div
            className="reader-setting-icon-container"
            onClick={() => {
              this.handleEnterReader("left");
              this.handleEnterReader("right");
              this.handleEnterReader("bottom");
              this.handleEnterReader("top");
            }}
          >
            <span className="icon-grid reader-setting-icon"></span>
          </div>
        )}
        <Toaster />

        <div
          className="left-panel"
          onMouseEnter={() => {
            if (this.state.isTouch || this.state.isOpenLeftPanel || this.state.isPreventTrigger) {
              this.setState({ hoverPanel: "left" });
              return;
            }
            this.handleEnterReader("left");
          }}
          onMouseLeave={() => {
            this.setState({ hoverPanel: "" });
          }}
          style={this.state.hoverPanel === "left" ? { opacity: 0.5 } : {}}
          onClick={() => {
            this.handleEnterReader("left");
          }}
        >
          <span className="icon-grid panel-icon"></span>
        </div>
        <div
          className="right-panel"
          onMouseEnter={() => {
            if (this.state.isTouch || this.state.isOpenRightPanel || this.state.isPreventTrigger) {
              this.setState({ hoverPanel: "right" });
              return;
            }
            this.handleEnterReader("right");
          }}
          onMouseLeave={() => {
            this.setState({ hoverPanel: "" });
          }}
          style={this.state.hoverPanel === "right" ? { opacity: 0.5 } : {}}
          onClick={() => {
            this.handleEnterReader("right");
          }}
        >
          <span className="icon-grid panel-icon"></span>
        </div>
        <div
          className="top-panel"
          onMouseEnter={() => {
            if (this.state.isTouch || this.state.isOpenTopPanel || this.state.isPreventTrigger) {
              this.setState({ hoverPanel: "top" });
              return;
            }
            this.handleEnterReader("top");
          }}
          style={this.state.hoverPanel === "top" ? { opacity: 0.5 } : {}}
          onMouseLeave={() => {
            this.setState({ hoverPanel: "" });
          }}
          onClick={() => {
            this.handleEnterReader("top");
          }}
        >
          <span className="icon-grid panel-icon"></span>
        </div>
        <div
          className="bottom-panel"
          onMouseEnter={() => {
            if (this.state.isTouch || this.state.isOpenBottomPanel || this.state.isPreventTrigger) {
              this.setState({ hoverPanel: "bottom" });
              return;
            }
            this.handleEnterReader("bottom");
          }}
          style={this.state.hoverPanel === "bottom" ? { opacity: 0.5 } : {}}
          onMouseLeave={() => {
            this.setState({ hoverPanel: "" });
          }}
          onClick={() => {
            this.handleEnterReader("bottom");
          }}
        >
          <span className="icon-grid panel-icon"></span>
        </div>

        <div
          className="setting-panel-container"
          onMouseLeave={(event) => {
            this.handleLeaveReader("right");
          }}
          style={
            this.state.isOpenRightPanel
              ? {}
              : {
                  transform: "translateX(309px)",
                }
          }
        >
          <SettingPanel />
        </div>
        <div
          className="navigation-panel-container"
          onMouseLeave={(event) => {
            this.handleLeaveReader("left");
          }}
          style={
            this.state.isOpenLeftPanel
              ? {}
              : {
                  transform: "translateX(-309px)",
                }
          }
        >
          <NavigationPanel {...{ time: this.state.time }} />
        </div>
        <div
          className="progress-panel-container"
          onMouseLeave={(event) => {
            this.handleLeaveReader("bottom");
          }}
          style={
            this.state.isOpenBottomPanel
              ? {}
              : {
                  transform: "translateY(110px)",
                }
          }
        >
          <ProgressPanel {...{ time: this.state.time }} />
        </div>
        <div
          className="operation-panel-container"
          onMouseLeave={(event) => {
            this.handleLeaveReader("top");
          }}
          style={
            this.state.isOpenTopPanel
              ? {}
              : {
                  transform: "translateY(-110px)",
                }
          }
        >
          {/* {this.props.htmlBook && <OperationPanel {...{ time: this.state.time }} />} */}
        </div>

        {this.props.currentBook.key && <Viewer {...renditionProps} />}
      </div>
    );
  }
}

export default Reader;
