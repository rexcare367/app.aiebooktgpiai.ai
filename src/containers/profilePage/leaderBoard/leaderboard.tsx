import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import "./leaderboard.css";
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

const Leaderboard: React.FC = () => {
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
      <div className="leaderboard-container">
        <div className="loading-container">Loading leaderboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="flex items-center gap-2 mb-5">
        <h1 className="text-2xl font-bold">Super Readers Leaderboard</h1>
        <Trophy size={32} color="#ffd700" />
      </div>

      <div className="leaderboard-content">
        <section className="leaderboard-section">
          <div className="section-header">
            <Book size={24} />
            <h2 className="section-title">Top Readers</h2>
          </div>
          <div className="user-cards">
            {(leaderboard?.top_readers || []).map((user, index) => (
              <UserCard key={`${user.user_ic}-reader`} user={user} rank={index + 1} type="books" />
            ))}
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="section-header">
            <Clock size={24} />
            <h2 className="section-title">Top Reading Time</h2>
          </div>
          <div className="user-cards">
            {(leaderboard?.top_reading_time || []).map((user, index) => (
              <UserCard key={`${user.user_ic}-time`} user={user} rank={index + 1} type="time" />
            ))}
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="section-header">
            <Trophy size={24} />
            <h2 className="section-title">Top Quiz Scores</h2>
          </div>
          <div className="user-cards">
            {(leaderboard?.top_quiz_scores || []).map((user, index) => (
              <UserCard
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

export default Leaderboard;
