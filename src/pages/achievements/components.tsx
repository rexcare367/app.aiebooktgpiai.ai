import React from "react";
import { Trophy } from "lucide-react";
import Manager from "../manager";
import { SchoolLeaderboardSection } from "./SchoolLeaderboardSection";

export const AchievementPage = () => {
  return (
    <Manager>
      <div className="w-full p-4 rounded-2xl overflow-auto">
          <SchoolLeaderboardSection />
      </div>
    </Manager>
  );
};
