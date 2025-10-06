import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, CheckCircle, Award } from "lucide-react";
import Manager from "../../pages/manager";
import RewardSkeleton from "../../components/skeletons/RewardSkeleton";

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
      <div className="w-full p-4 overflow-auto h-[calc(100vh_-_88px)]">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Trophy className="h-7 w-7" />
            </div>
            Rewards
          </h1>
        </div>

        <div>
          {isLoading ? (
            <RewardSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards?.map((reward, index) => (
                <div
                  key={`${index}-${reward.rewardId}`}
                  className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 flex flex-col min-h-[400px]"
                >
                  <div className="flex flex-col items-center text-center gap-4 mb-6">
                    <div className="relative">
                      <img 
                        src={reward.badge} 
                        alt="reward badge" 
                        className="w-28 h-28 rounded-full border-4 border-gray-100 dark:border-gray-700 shadow-md" 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{reward.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{reward.school}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Requirements</h4>
                    {reward.condition
                      .filter((condition: iCondition) => condition.limit > 0)
                      .map((condition: iCondition, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Award className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold capitalize">{condition?.field?.replace("_", " ")}</span>:{" "}
                            <span className="font-bold text-gray-900 dark:text-gray-100">{condition.limit}</span>
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-sm">
                      {reward.status}
                    </span>
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
