import React from "react";
import "./LeaderboardCard.css";

interface LeaderboardCardProps {
  user: {
    user_ic: string;
    name: string;
    school: string;
    total_read_books: number;
    total_read_period: number;
    quiz_score?: number;
  };
  rank: number;
  type: "books" | "time" | "quiz";
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, rank, type }) => {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <div className="medal gold">1</div>;
      case 2:
        return <div className="medal silver">2</div>;
      case 3:
        return <div className="medal bronze">3</div>;
      default:
        return <div className="rank">{rank}</div>;
    }
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="leaderboard-card">
      <div className="card-left">
        {getMedalIcon(rank)}
        <div className="user-info">
          <span className="user-name" title={user.name ?? user.user_ic}>
            {user.name ? user.name.split(" ")[0] : "Test-User"}
          </span>
          {rank <= 3 && user.school && (
            <span className="user-school" title={user.school}>
              {user.school}
            </span>
          )}
        </div>
      </div>
      <div className="card-right">
        {type === "books" ? (
          <div className="stat-item">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{user.total_read_books}</div>
            <div className="stat-label">Books Read</div>
          </div>
        ) : type === "time" ? (
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatReadingTime(user.total_read_period)}</div>
            <div className="stat-label">Reading Time</div>
          </div>
        ) : (
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{user.quiz_score} pts</div>
            <div className="stat-label">Quiz Score</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;