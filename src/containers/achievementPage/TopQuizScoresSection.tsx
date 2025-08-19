import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, User } from "lucide-react";
import Loading from "../../components/loading/component";
import { UserAvatar } from "./UserAvatar";

interface QuizData {
  avatar_url: string;
  user_ic: string;
  name: string;
  school: string;
  value: number;
  book_file_key: string;
}

export const TopQuizScoresSection = () => {
  const [quizScores, setQuizScores] = useState<QuizData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizScores = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/ebooks/leaderboard/get`, {
        params: {
          org: "quiz_scores",
          group: "student",
          limit: 10,
        },
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid data received from server");
      }

      setQuizScores(response.data.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch quiz scores data";
      console.error("Quiz Scores Error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizScores();
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <section className="overflow-auto h-[calc(100vh_-_270px)] space-y-6">
      {quizScores.map((score, index) => (
        <div
          key={`${index}-${score.name}`}
          className="grid grid-cols-4 items-center border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
        >
          <div className="items-center gap-4 col-span-1 hidden lg:flex">
            <UserAvatar rank={index + 1} color="border-purple-500" />
            <p className="font-medium text-slate-800 dark:text-slate-100">{score.user_ic}</p>
          </div>

          <div className="flex items-center gap-4 col-span-3 lg:col-span-2">
            {score.avatar_url ? (
              <img src={score.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
            )}
            <div>
              <p className="block lg:hidden font-medium text-slate-800 dark:text-slate-100">{score.user_ic}</p>
              <p className="font-medium text-slate-800 dark:text-slate-100 text-xs lg:text-lg">
                {score.name ?? "Test-User"}
              </p>
              {score.school && (
                <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
                  {score.school ?? "Test-School"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 col-span-1">
            <Trophy className="h-5 w-5 text-purple-500" />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{score.value}</span>
            <span className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">pts</span>
          </div>
        </div>
      ))}
    </section>
  );
};
