import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, BookOpen, Clock, Award } from "lucide-react";
import Manager from "../../pages/manager";
import Loading from "../../components/loading/component";
import { TopReadersSection } from "./TopReadersSection";
import { TopReadingTimeSection } from "./TopReadingTimeSection";
import { TopQuizScoresSection } from "./TopQuizScoresSection";

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

interface ReaderData {
  avatar_url: string;
  user_ic: string;
  name: string;
  school: string;
  total_read_books: number;
  total_read_period: number;
}

interface QuizData {
  avatar_url: string;
  user_ic: string;
  name: string;
  school: string;
  score: number;
  book_file_key: string;
}

export const AchievementPage = () => {
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
          {activeTab === "readers" && <TopReadersSection />}
          {activeTab === "time" && <TopReadingTimeSection />}
          {activeTab === "quiz" && <TopQuizScoresSection />}
        </div>
      </div>
    </Manager>
  );
};
