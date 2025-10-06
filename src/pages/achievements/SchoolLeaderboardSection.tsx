import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import AchievementSkeleton from "../../components/skeletons/AchievementSkeleton";
import authService from "../../utils/authService";
import { Trophy, Users, Search, ChevronLeft, ChevronRight, Star, User as UserIcon } from "lucide-react";

interface LeaderboardRow {
  rank: number;
  user_id: string;
  name: string;
  ic_number: string;
  avatar_url: string | null;
  total_score: number;
  reading_sessions: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardRow[];
    total_count: number;
    page: number;
    limit: number;
    school_id: string;
    school_name: string;
  };
  message?: string;
  error?: unknown;
}

export const SchoolLeaderboardSection = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [schoolName, setSchoolName] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const fetchLeaderboard = async (targetPage: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = authService.getUserData();
      const schoolId = user?.school_id;
      if (!schoolId) {
        throw new Error("Missing user school id");
      }

      const response = await api.get<LeaderboardResponse>(`/api/schools/${schoolId}/leaderboard`, {
        params: { page: targetPage, limit },
      });

      const payload = response.data;
      if (!payload?.success || !payload.data) {
        throw new Error(payload?.message || "Failed to load leaderboard");
      }

      setRows(payload.data.leaderboard || []);
      setTotalCount(payload.data.total_count || 0);
      setSchoolName(payload.data.school_name || "");
      setPage(payload.data.page || targetPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch leaderboard";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.ic_number.toLowerCase().includes(q));
  }, [rows, query]);

  // Single list view; show all rows in one list

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (isLoading) return <AchievementSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">School Leaderboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{schoolName || ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{totalCount} participants</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or IC..."
              className="pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-800">
        <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b border-gray-200 dark:border-gray-600">
          <div className="col-span-2">Rank</div>
          <div className="col-span-6">Student</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2 text-right">Sessions</div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-auto h-[calc(100vh-265px)] bg-white dark:bg-gray-800">
          {filteredRows.map((item) => (
            <div
              key={item.user_id}
              className="grid grid-cols-12 items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              <div className="col-span-2">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm font-bold">
                  {item.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                {item.avatar_url ? (
                  <img src={item.avatar_url} alt={item.name} className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.ic_number}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-gray-900 dark:text-gray-100">{item.total_score}</span>
              </div>
              <div className="col-span-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.reading_sessions}
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">No results found</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SchoolLeaderboardSection;
