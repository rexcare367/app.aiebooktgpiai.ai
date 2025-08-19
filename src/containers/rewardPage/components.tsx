import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, CheckCircle, Award } from "lucide-react";
import Manager from "../../pages/manager";
import Loading from "../../components/loading/component";

interface iCondition {
  field: string;
  limit: number;
}

interface RewardsData {
  rewardId: string;
  badge: string;
  title: string;
  school: string;
  description: string;
  status: string;
  condition: iCondition[];
}

export const RewardPage = () => {
  const [rewards, setRewards] = useState<RewardsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleGetRewards = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/ebooks/reward/list`);

      if (!response.data || !response.data.data) {
        console.error("Invalid API response structure:", response.data);
        throw new Error("Invalid data received from server");
      }

      const data = response.data.data;
      setRewards(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch rewards data";
      console.error("Rewards Error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetRewards();
  }, []);

  return (
    <Manager>
      <div className="w-full p-4 rounded-2xl bg-white overflow-auto h-[calc(100vh_-_88px)]">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          Rewards
        </h1>

        <div className="mt-6">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewards?.map((reward, index) => (
                <div
                  key={`${index}-${reward.rewardId}`}
                  className=" max-w-72 bg-white dark:bg-slate-800 rounded-xl border-2 border-solid border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 flex flex-col min-h-[400px]"
                >
                  <div className="flex flex-col items-center text-center gap-4 mb-6">
                    <img src={reward.badge} alt="reward badge" className="w-24 h-24 rounded-full" />
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{reward.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{reward.school}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    {reward.condition
                      .filter((condition: iCondition) => condition.limit > 0)
                      .map((condition: iCondition, idx: number) => (
                        <div key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          • <span className="font-medium">{condition?.field?.replace("_", " ")}</span>:{" "}
                          <span className="font-bold">{condition.limit}</span>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-500">{reward.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Manager>
  );
};
