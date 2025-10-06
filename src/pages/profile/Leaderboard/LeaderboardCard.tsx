import React from "react";

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
        return <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)' }}>1</div>;
      case 2:
        return <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all duration-300" style={{ background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', boxShadow: '0 4px 12px rgba(192, 192, 192, 0.4)' }}>2</div>;
      case 3:
        return <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all duration-300" style={{ background: 'linear-gradient(135deg, #CD7F32, #8B4513)', boxShadow: '0 4px 12px rgba(205, 127, 50, 0.4)' }}>3</div>;
      default:
        return <div className="text-2xl font-bold min-w-10 text-center transition-all duration-300" style={{ color: 'var(--text-color-2)' }}>{rank}</div>;
    }
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div 
      className="flex justify-between items-center p-6 rounded-[1.25rem] mb-5 transition-all duration-300 border cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-xl"
      style={{ 
        backgroundColor: 'var(--bg-color)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex items-center gap-6">
        {getMedalIcon(rank)}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-lg mb-1 transition-all duration-300 block" style={{ color: 'var(--text-color)' }} title={user.name ?? user.user_ic}>
            {user.name ? user.name.split(" ")[0] : "Test-User"}
          </span>
          {rank <= 3 && user.school && (
            <span className="text-sm italic transition-all duration-300 block" style={{ color: 'var(--text-color-2)' }} title={user.school}>
              {user.school}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {type === "books" ? (
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-xl font-bold mb-1 transition-all duration-300" style={{ color: 'var(--active-theme-color)' }}>{user.total_read_books}</div>
            <div className="text-xs text-center font-medium" style={{ color: 'var(--text-color-2)' }}>Books Read</div>
          </div>
        ) : type === "time" ? (
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-xl font-bold mb-1 transition-all duration-300" style={{ color: 'var(--active-theme-color)' }}>{formatReadingTime(user.total_read_period)}</div>
            <div className="text-xs text-center font-medium" style={{ color: 'var(--text-color-2)' }}>Reading Time</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xl font-bold mb-1 transition-all duration-300" style={{ color: 'var(--active-theme-color)' }}>{user.quiz_score} pts</div>
            <div className="text-xs text-center font-medium" style={{ color: 'var(--text-color-2)' }}>Quiz Score</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;