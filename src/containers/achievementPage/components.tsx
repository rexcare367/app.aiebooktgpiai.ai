import React from "react";
import { Trophy } from "lucide-react";
import Manager from "../../pages/manager";
import { SchoolLeaderboardSection } from "./SchoolLeaderboardSection";

export const AchievementPage = () => {
  return (
    <Manager>
      <div className="w-full p-4 rounded-2xl bg-transparent/20 overflow-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          Achievements
        </h1>
        <div className="mt-6">
          <SchoolLeaderboardSection />
        </div>
      </div>
    </Manager>
  );
};
