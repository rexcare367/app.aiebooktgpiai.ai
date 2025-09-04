import React from 'react';

interface NoteSkeletonProps {
  count?: number;
}

const NoteSkeleton: React.FC<NoteSkeletonProps> = ({ count = 12 }) => {
  const renderSkeletonCard = () => (
    <div className="p-4 border rounded-lg animate-pulse w-full" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="flex gap-2 mt-3">
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 rounded-full w-14"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="note-list-container-parent h-[calc(100vh_-_78px)] bg-transparent/20 rounded-xl">
      {/* Note tags skeleton */}
      <div className="note-tags mb-4">
        <div className="flex gap-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 bg-gray-300 rounded-full w-20"></div>
          ))}
        </div>
      </div>
      
      {/* Cards grid skeleton */}
      <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2 justify-items-center">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="w-full">
            {renderSkeletonCard()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteSkeleton;
