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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">School Leaderboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{schoolName || ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Users className="h-4 w-4" />
            <span>{totalCount} participants</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or IC..."
              className="pl-9 pr-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="col-span-2">Rank</div>
          <div className="col-span-6">Student</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2 text-right">Sessions</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRows.map((item) => (
            <div
              key={item.user_id}
              className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
            >
              <div className="col-span-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-semibold">
                  {item.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                {item.avatar_url ? (
                  <img src={item.avatar_url} alt={item.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.ic_number}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{item.total_score}</span>
              </div>
              <div className="col-span-2 text-right text-sm text-slate-800 dark:text-slate-100">
                {item.reading_sessions}
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">No results</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded-md border text-sm flex items-center gap-1 ${
              canPrev
                ? "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                : "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
            }`}
            onClick={() => canPrev && fetchLeaderboard(page - 1)}
            disabled={!canPrev}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            className={`px-3 py-2 rounded-md border text-sm flex items-center gap-1 ${
              canNext
                ? "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                : "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
            }`}
            onClick={() => canNext && fetchLeaderboard(page + 1)}
            disabled={!canNext}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SchoolLeaderboardSection;
