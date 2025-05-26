import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, BookOpen, Clock, Award } from "lucide-react";
import Manager from "../../pages/manager";
import Loading from "../../components/loading/component";

interface UserAvatarProps {
  rank: number;
  color: string;
}

function UserAvatar({ rank, color }: UserAvatarProps) {
  return (
    <div
      className={`h-12 w-12 rounded-full border-solid border border-1 ${color} flex items-center justify-center font-bold`}
    >
      {rank}
    </div>
  );
}

interface LeaderboardData {
  top_readers: Array<{
    avatar_url: string;
    user_ic: string;
    name: string;
    school: string;
    total_read_books: number;
    total_read_period: number;
  }>;
  top_reading_time: Array<{
    avatar_url: string;
    user_ic: string;
    name: string;
    school: string;
    total_read_books: number;
    total_read_period: number;
  }>;
  top_quiz_scores: Array<{
    avatar_url: string;
    user_ic: string;
    name: string;
    school: string;
    score: number;
    book_file_key: string;
  }>;
}

const defaultLeaderboardData: LeaderboardData = {
  top_readers: [],
  top_reading_time: [],
  top_quiz_scores: [],
};

export const AchievementPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>(defaultLeaderboardData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("readers");

  const tabs = [
    {
      id: "readers",
      label: "Top Readers",
      shortLabel: "Readers",
      icon: <BookOpen className={`h-4 w-4 ${activeTab === "readers" ? "text-emerald-500" : "text-slate-500"}`} />,
    },
    {
      id: "time",
      label: "Reading Time",
      shortLabel: "Time",
      icon: <Clock className={`h-4 w-4 ${activeTab === "time" ? "text-blue-500" : "text-slate-500"}`} />,
    },
    {
      id: "quiz",
      label: "Quiz Scores",
      shortLabel: "Quiz",
      icon: <Award className={`h-4 w-4 ${activeTab === "quiz" ? "text-purple-500" : "text-slate-500"}`} />,
    },
  ];

  const handleGetLeaderboard = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/ebooks/leaderboard/get`);

      if (!response.data || !response.data.data) {
        console.error("Invalid API response structure:", response.data);
        throw new Error("Invalid data received from server");
      }

      const data = response.data.data;

      // Validate the data structure
      if (!data.top_readers || !data.top_reading_time || !data.top_quiz_scores) {
        console.error("Missing required data fields:", data);
        throw new Error("Incomplete data received from server");
      }

      setLeaderboard({
        top_readers: Array.isArray(data.top_readers) ? data.top_readers : [],
        top_reading_time: Array.isArray(data.top_reading_time) ? data.top_reading_time : [],
        top_quiz_scores: Array.isArray(data.top_quiz_scores) ? data.top_quiz_scores : [],
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch leaderboard data";
      console.error("Leaderboard Error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
      setLeaderboard(defaultLeaderboardData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetLeaderboard();
  }, []);

  const TopReadersSection = () => {
    return (
      <section className="leaderboard-section">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Top Readers</h2>
        </div>

        <div className="space-y-6">
          {leaderboard?.top_readers.map((reader, index) => (
            <div
              key={`${index}-${reader.name}`}
              className="grid grid-cols-4  items-center border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
            >
              <div className="items-center gap-4 col-span-1 hidden lg:flex">
                <UserAvatar rank={index + 1} color="border-emerald-500" />
                <p className="font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
              </div>

              <div className="flex items-center gap-4 col-span-3 lg:col-span-2">
                <img src={reader.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="block lg:hidden font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100 text-xs lg:text-lg">
                    {reader.name ?? "Test-User"}
                  </p>
                  {reader.school && (
                    <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
                      {reader.school ?? "Test-School"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 col-span-1">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{reader.total_read_books}</span>
                <span className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">Books Read</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const TopReadingTimeSection = () => {
    return (
      <section className="leaderboard-section">
        <div className="section-header">
          <Clock size={24} className="text-blue-500" />
          <h2 className="section-title">Top Reading Time</h2>
        </div>
        <div className="space-y-6">
          {leaderboard?.top_reading_time.map((reader, index) => (
            <div
              key={`${index}-${reader.name}`}
              className="grid grid-cols-4  items-center border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
            >
              <div className="items-center gap-4 col-span-1 hidden lg:flex">
                <UserAvatar rank={index + 1} color="border-blue-500" />
                <p className="font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
              </div>

              <div className="flex items-center gap-4 col-span-3 lg:col-span-2">
                <img src={reader.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="block lg:hidden font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100 text-xs lg:text-lg">
                    {reader.name ?? "Test-User"}
                  </p>
                  {reader.school && (
                    <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
                      {reader.school ?? "Test-School"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 col-span-1">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{reader.total_read_period}</span>
                <span className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">Reading Time</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const TopQuizScoresSection = () => {
    return (
      <section className="leaderboard-section">
        <div className="section-header">
          <Trophy size={24} className="text-purple-500" />
          <h2 className="section-title">Top Quiz Scores</h2>
        </div>
        <div className="space-y-6">
          {leaderboard?.top_quiz_scores.map((reader, index) => (
            <div
              key={`${index}-${reader.name}`}
              className="grid grid-cols-4  items-center border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
            >
              <div className="items-center gap-4 col-span-1 hidden lg:flex">
                <UserAvatar rank={index + 1} color="border-purple-500" />
                <p className="font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
              </div>

              <div className="flex items-center gap-4 col-span-3 lg:col-span-2">
                <img src={reader.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="block lg:hidden font-medium text-slate-800 dark:text-slate-100">{reader.user_ic}</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100 text-xs lg:text-lg">
                    {reader.name ?? "Test-User"}
                  </p>
                  {reader.school && (
                    <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
                      {reader.school ?? "Test-School"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 col-span-1">
                <Trophy className="h-5 w-5 text-purple-500" />
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{reader.score}</span>
                <span className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">pts</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <Manager>
      <div className="w-full p-4 rounded-2xl bg-white overflow-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          Achievements
        </h1>
        <div className="">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 shadow-sm"
                    : "hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline font-medium text-sm">{tab.label}</span>
                <span className="sm:hidden font-medium text-sm">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Loading />
          ) : (
            <React.Fragment>
              {activeTab === "readers" && <TopReadersSection />}
              {activeTab === "time" && <TopReadingTimeSection />}
              {activeTab === "quiz" && <TopQuizScoresSection />}
            </React.Fragment>
          )}
        </div>
      </div>
    </Manager>
  );
};
