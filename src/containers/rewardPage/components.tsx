import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { Trophy, BookOpen, CheckCircle, Award } from "lucide-react";
import Manager from "../../pages/manager";
import Loading from "../../components/loading/component";

interface UserAvatarProps {
  rank: number;
  color: string;
}

function UserAvatar({ rank, color }: UserAvatarProps) {
  return (
    <div
      className={`h-12 w-12 rounded-full border-solid border border-1 ${color} flex items-center justify-center font-bold`}
    >
      {rank}
    </div>
  );
}

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

  const [activeTab, setActiveTab] = useState("rewards");

  const tabs = [
    {
      id: "rewards",
      label: "Rewards",
      shortLabel: "Rewards",
      icon: <Award className={`h-4 w-4 ${activeTab === "rewards" ? "text-emerald-500" : "text-slate-500"}`} />,
    },
  ];

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

  const TopReadersSection = () => {
    return (
      <section className="rewards-section">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Rewards</h2>
        </div>

        <div className="space-y-6">
          {rewards?.map((reward, index) => (
            <div
              key={`${index}-${reward.rewardId}`}
              className="grid grid-cols-4  items-center border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
            >
              <div className="items-center gap-4 col-span-1">
                <img src={reward.badge} alt="avatar" className="w-12 h-12 rounded-full" />
                <p className="font-medium text-slate-800 dark:text-slate-100">{reward.title}</p>
              </div>

              <div className="flex items-center gap-4 col-span-3 lg:col-span-2 text-sm lg:text-lg">
                <div>
                  {reward.condition
                    .filter((condition: iCondition) => condition.limit > 0)
                    .map((condition: iCondition) => {
                      return (
                        <div>
                          - <span className="font-bold">{condition?.field?.replace("_", " ")}</span> should be higher
                          than <span className=" font-bold">{condition.limit}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="items-center gap-2 col-span-1 hidden lg:flex">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{reward.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <Manager>
      <div className="w-full p-4 rounded-2xl bg-white overflow-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          Rewards
        </h1>
        <div className="">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 shadow-sm"
                    : "hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline font-medium text-sm">{tab.label}</span>
                <span className="sm:hidden font-medium text-sm">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Loading />
          ) : (
            <React.Fragment>{activeTab === "rewards" && <TopReadersSection />}</React.Fragment>
          )}
        </div>
      </div>
    </Manager>
  );
};
