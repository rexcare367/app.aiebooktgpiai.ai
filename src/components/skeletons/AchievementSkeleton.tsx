import React from 'react';

const AchievementSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-300"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-48"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900 px-4 py-2">
          <div className="col-span-2 h-3 bg-gray-300 rounded w-8"></div>
          <div className="col-span-6 h-3 bg-gray-300 rounded w-16"></div>
          <div className="col-span-2 h-3 bg-gray-300 rounded w-12"></div>
          <div className="col-span-2 h-3 bg-gray-300 rounded w-16"></div>
        </div>
        
        {/* Table rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 items-center px-4 py-3">
              <div className="col-span-2">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-8"></div>
              </div>
              <div className="col-span-2 text-right">
                <div className="h-4 bg-gray-300 rounded w-6 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-300 rounded w-16"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSkeleton;
