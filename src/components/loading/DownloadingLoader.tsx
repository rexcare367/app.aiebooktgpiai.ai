import React, { useState, useEffect } from 'react';

interface DownloadingLoaderProps {
  bookTitle?: string;
  progress?: number;
  isVisible?: boolean;
  className?: string;
  onCancel?: () => void;
}

const DownloadingLoader: React.FC<DownloadingLoaderProps> = ({ 
  bookTitle = "Loading book...", 
  progress = 0, 
  isVisible = true,
  className = "",
  onCancel
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate progress bar with smooth transitions
  useEffect(() => {
    if (progress > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}>
      <div 
        className="relative p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--bg-color)', 
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Close button */}
        {onCancel && (
          <div className="absolute top-4 right-4">
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: 'var(--border-color)',
                color: 'var(--text-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--active-theme-color)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-color)';
              }}
              aria-label="Cancel download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="text-center">
          {/* Download icon with animation */}
          <div className="relative mb-6">
            <div 
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`} 
              style={{ backgroundColor: 'var(--active-theme-light)' }}
            >
              <svg 
                className={`w-8 h-8 transition-all duration-300 ${
                  progress > 0 ? 'animate-pulse' : 'animate-bounce'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--active-theme-color)' }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            
            {/* Rotating ring around icon */}
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <svg 
                className={`w-16 h-16 transition-all duration-500 ${
                  progress > 0 ? 'animate-spin' : 'animate-pulse'
                }`} 
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="60 40"
                  strokeDashoffset="0"
                  style={{ 
                    color: 'var(--active-theme-color)', 
                    opacity: progress > 0 ? 0.5 : 0.3 
                  }}
                />
              </svg>
            </div>
            
            {/* Progress ring */}
            {progress > 0 && (
              <div className="absolute inset-0 w-16 h-16 mx-auto">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - displayProgress / 100)}`}
                    style={{ 
                      color: 'var(--active-theme-color)',
                      transition: 'stroke-dashoffset 0.5s ease-in-out'
                    }}
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 
            className="text-lg font-semibold mb-2 truncate px-4" 
            style={{ color: 'var(--text-color)' }}
            title={bookTitle}
          >
            {bookTitle}
          </h3>

          {/* Status text */}
          <p 
            className="text-sm mb-6" 
            style={{ color: 'var(--text-color-2)' }}
          >
            {progress > 0 ? `Downloading${dots}` : `Preparing${dots}`}
          </p>

          {/* Progress bar */}
          <div className="w-full mb-4">
            <div 
              className="w-full h-3 rounded-full overflow-hidden relative" 
              style={{ backgroundColor: 'var(--border-color)' }}
            >
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--active-theme-color)',
                  width: `${displayProgress}%`,
                  boxShadow: displayProgress > 0 ? '0 0 15px rgba(59, 130, 246, 0.6)' : 'none'
                }}
              >
                {/* Shimmer effect */}
                {displayProgress > 0 && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                )}
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="flex justify-between items-center mt-3">
              <span 
                className="text-sm font-semibold transition-all duration-300" 
                style={{ 
                  color: displayProgress > 0 ? 'var(--active-theme-color)' : 'var(--text-color-2)'
                }}
              >
                {progress > 0 ? `${Math.round(displayProgress)}%` : 'Initializing...'}
              </span>
              <span 
                className="text-xs font-medium" 
                style={{ color: 'var(--text-color-2)' }}
              >
                {progress > 0 ? 'Downloading' : 'Preparing'}
              </span>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-xs" style={{ color: 'var(--text-color-2)' }}>
            {progress > 0 ? (
              <span>Please wait while we download your book</span>
            ) : (
              <span>Setting up your reading experience</span>
            )}
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div 
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: 'var(--active-theme-color)' }}
          />
          <div 
            className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: 'var(--active-theme-color)' }}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default DownloadingLoader;
