import React from 'react';

interface RewardSkeletonProps {
  count?: number;
}

const RewardSkeleton: React.FC<RewardSkeletonProps> = ({ count = 6 }) => {
  const renderSkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 flex flex-col min-h-[400px] animate-pulse">
      <div className="flex flex-col items-center text-center gap-4 mb-6">
        <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-gray-100 dark:border-gray-600"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-grow bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-3"></div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeletonCard()}
        </div>
      ))}
    </div>
  );
};

export default RewardSkeleton;
