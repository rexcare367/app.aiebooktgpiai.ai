import React from 'react';

interface RewardSkeletonProps {
  count?: number;
}

const RewardSkeleton: React.FC<RewardSkeletonProps> = ({ count = 6 }) => {
  const renderSkeletonCard = () => (
    <div className="max-w-72 bg-transparent/20 dark:bg-slate-800 rounded-xl border-2 border-solid border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 flex flex-col min-h-[400px] animate-pulse">
      <div className="flex flex-col items-center text-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-300"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-grow">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-300 rounded w-full"></div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="h-5 w-5 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeletonCard()}
        </div>
      ))}
    </div>
  );
};

export default RewardSkeleton;
