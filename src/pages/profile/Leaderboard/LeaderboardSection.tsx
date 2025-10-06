import React, { useEffect, useState } from "react";
import LeaderboardCard from "./LeaderboardCard";
import axios from "axios";
import api from "../../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, Book, Clock } from "lucide-react";

interface LeaderboardData {
  top_readers: Array<{
    user_ic: string;
    name: string;
    school: string;
    total_read_books: number;
    total_read_period: number;
  }>;
  top_reading_time: Array<{
    user_ic: string;
    name: string;
    school: string;
    total_read_books: number;
    total_read_period: number;
  }>;
  top_quiz_scores: Array<{
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

const LeaderboardSection: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>(defaultLeaderboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="w-full my-8 mx-auto p-8 rounded-[1.25rem] shadow-lg border transition-all duration-300" style={{ backgroundColor: 'var(--bg-color-2)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center justify-center min-h-[200px] text-lg rounded-2xl border shadow-sm" style={{ color: 'var(--text-color-2)', backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>Loading leaderboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full my-8 mx-auto p-8 rounded-[1.25rem] shadow-lg border transition-all duration-300" style={{ backgroundColor: 'var(--bg-color-2)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center justify-center min-h-[200px] text-lg rounded-2xl border shadow-sm" style={{ color: '#ef4444', backgroundColor: 'var(--bg-color)', borderColor: '#ef4444', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full my-8 mx-auto p-8 rounded-[1.25rem] shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" style={{ backgroundColor: 'var(--bg-color-2)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
      <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-3xl md:text-2xl font-bold m-0" style={{ color: 'var(--text-color)' }}>Super Readers Leaderboard</h1>
        <Trophy size={32} color="#ffd700" />
      </div>

      <div className="mt-6">
        <section className="rounded-[1.25rem] p-6 md:p-8 shadow-lg border mb-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Book size={24} />
            <h2 className="text-xl font-semibold m-0" style={{ color: 'var(--text-color)' }}>Top Readers</h2>
          </div>
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
            {(leaderboard?.top_readers || []).map((user, index) => (
              <LeaderboardCard key={`${user.user_ic}-reader`} user={user} rank={index + 1} type="books" />
            ))}
          </div>
        </section>

        <section className="rounded-[1.25rem] p-6 md:p-8 shadow-lg border mb-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Clock size={24} />
            <h2 className="text-xl font-semibold m-0" style={{ color: 'var(--text-color)' }}>Top Reading Time</h2>
          </div>
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
            {(leaderboard?.top_reading_time || []).map((user, index) => (
              <LeaderboardCard key={`${user.user_ic}-time`} user={user} rank={index + 1} type="time" />
            ))}
          </div>
        </section>

        <section className="rounded-[1.25rem] p-6 md:p-8 shadow-lg border mb-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Trophy size={24} />
            <h2 className="text-xl font-semibold m-0" style={{ color: 'var(--text-color)' }}>Top Quiz Scores</h2>
          </div>
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
            {(leaderboard?.top_quiz_scores || []).map((user, index) => (
              <LeaderboardCard
                key={`${user.user_ic}-quiz`}
                user={{
                  ...user,
                  total_read_books: 0,
                  total_read_period: 0,
                  quiz_score: user.score,
                }}
                rank={index + 1}
                type="quiz"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeaderboardSection;