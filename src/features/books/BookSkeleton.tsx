import React from 'react';

interface BookSkeletonProps {
  count?: number;
  viewMode?: string;
}

const BookSkeleton: React.FC<BookSkeletonProps> = ({ count = 12, viewMode = 'card' }) => {
  const renderSkeletonItem = () => {
    if (viewMode === 'list') {
      return (
        <div className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse w-full" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
          <div className="w-16 h-20 bg-gray-300 rounded flex-shrink-0"></div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      );
    }

    if (viewMode === 'cover') {
      return (
        <div className="animate-pulse w-full max-w-24">
          <div className="w-24 h-32 bg-gray-300 rounded mx-auto"></div>
          <div className="mt-2 space-y-1">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      );
    }

    // Default card view
    return (
      <div className="p-4 border rounded-lg animate-pulse w-full" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
        <div className="w-full h-40 bg-gray-300 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2 justify-items-center">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          {renderSkeletonItem()}
        </div>
      ))}
    </div>
  );
};

export default BookSkeleton;
