import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../utils/axios";
import authService, { UserData } from "../../../utils/authService";
import Book from "../../../models/Book";

type Quiz = { question: string; answer: string[]; id: string };

interface QuizModalProps {
  show: boolean;
  onClose: () => void;
  book: Book;
  onScore: (score: string) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ show, onClose, book, onScore }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([{ question: "", answer: [], id: "" }]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState("0");
  const [step, setStep] = useState<"question" | "result">("question");
  const [selected, setSelected] = useState<Record<number, string>>({});

  const userData: UserData | null = authService.getUserData();
  const user_ic = userData?.ic_number;

  const generateQuiz = useCallback(async () => {
    await api
      .post(`/api/ebooks/generate-quiz`, {
        book_id: book.key,
        user_ic: user_ic,
      })
      .then((res) => {
        const _quizzes = res.data.quizzes as Quiz[];
        setQuizzes(_quizzes);
      });
  }, [book.key, user_ic]);

  useEffect(() => {
    if (book.file_key && show) {
      setLoading(true);
      generateQuiz().finally(() => setLoading(false));
    }
  }, [show, book.file_key, generateQuiz]);

  useEffect(() => {
    // Reset selections when quizzes change or modal opens
    if (show) setSelected({});
  }, [show, quizzes.length]);

  const submitAnswer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const selectedAnswers = quizzes.map((q, i) => {
      return { quizId: q.id, answer: formData.get(`quiz-${i}`) };
    });

    try {
      await api
        .post(`/api/ebooks/submit-answer`, {
          answers: selectedAnswers,
        })
        .then((res) => {
          setScore(res.data.score);
          onScore(res.data.score);
          setStep("result");
          toast.success("Score saved");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } catch (error) {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-800/85 to-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-[92vw] max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
          {step === "result" ? (
            <h2 className="m-0 text-white text-xl font-bold">Quiz Results</h2>
          ) : (
            <h2 className="m-0 text-white text-xl font-bold">Great job finishing the book!</h2>
          )}
        </div>

        {step === "result" ? (
          <div className="p-7 flex flex-col items-center justify-center flex-1 overflow-y-auto">
            {parseFloat(score) > 2 ? (
              <>
                <div className="w-14 h-14 rounded-full grid place-items-center text-2xl font-bold mb-2 bg-green-100 text-green-600">✓</div>
                <p className="m-0 mb-1 text-lg font-bold text-emerald-800">Well done!</p>
                <p className="m-0 text-slate-600">
                  You answered <span className="font-bold text-gray-900">{score}</span> correctly
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full grid place-items-center text-2xl font-bold mb-2 bg-red-100 text-red-600">✗</div>
                <p className="m-0 mb-1 text-lg font-bold text-red-900">Good effort!</p>
                <p className="m-0 text-slate-600">You answered {score} correctly</p>
              </>
            )}
          </div>
        ) : (
          <form id="quiz-form" onSubmit={submitAnswer} className="p-6 flex-1 overflow-hidden">
            <p className="m-0 mb-3 text-slate-600">Ready for a quick quiz?</p>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {loading ? (
                <SkeletonQuestions count={5} />
              ) : (
                <fieldset className="m-0 p-0 border-0">
                  {quizzes.map((quiz, i) => (
                    <div key={quiz.id || i} className="py-3 border-b border-slate-200">
                      <p className="m-0 mb-2 text-slate-900 font-semibold">
                        {i + 1}. {quiz.question}
                      </p>
                      <div className="grid gap-2">
                        {quiz.answer.map((answer, j) => (
                          <label key={`${quiz.id}-${j}`} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-colors">
                            <input
                              className="w-4 h-4"
                              type="radio"
                              name={`quiz-${i}`}
                              value={`${j}`}
                              id={`answer-${i}-${j}`}
                              onChange={(e) =>
                                setSelected((prev) => ({ ...prev, [i]: e.currentTarget.value }))
                              }
                              required
                            />
                            <span className="text-slate-900">{answer}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </fieldset>
              )}
            </div>
          </form>
        )}

        <div className="flex gap-3 justify-end p-5 bg-slate-50">
          {step === "result" ? (
            <button
              className="inline-flex items-center rounded-lg px-4 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                onClose();
                setStep("question");
              }}
            >
              Back to Reading
            </button>
          ) : (
            <>
              <button
                className="inline-flex items-center rounded-lg px-4 py-2 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  onClose();
                  setStep("question");
                }}
              >
                Not Now
              </button>
              <SubmitButton loading={loading} allAnswered={Object.keys(selected).length === quizzes.length} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonQuestions: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="py-3 border-b border-slate-200">
          <div className="h-4 w-3/4 bg-slate-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

const SubmitButton: React.FC<{ loading: boolean; allAnswered: boolean }> = ({ loading, allAnswered }) => {
  return (
    <button
      type="submit"
      form="quiz-form"
      className="inline-flex items-center rounded-lg px-4 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={loading || !allAnswered}
    >
      Submit Answers
    </button>
  );
};

export default QuizModal;


