import { useState, useCallback } from 'react';

interface DownloadingState {
  isDownloading: boolean;
  progress: number;
  bookTitle: string;
  currentBookId: string | null;
}

export const useDownloadingState = () => {
  const [downloadingState, setDownloadingState] = useState<DownloadingState>({
    isDownloading: false,
    progress: 0,
    bookTitle: '',
    currentBookId: null
  });

  const startDownloading = useCallback((bookTitle: string, bookId: string) => {
    setDownloadingState({
      isDownloading: true,
      progress: 0,
      bookTitle,
      currentBookId: bookId
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setDownloadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const finishDownloading = useCallback(() => {
    setDownloadingState(prev => ({
      ...prev,
      isDownloading: false,
      progress: 100
    }));
    
    // Clear the state after a short delay
    setTimeout(() => {
      setDownloadingState({
        isDownloading: false,
        progress: 0,
        bookTitle: '',
        currentBookId: null
      });
    }, 1000);
  }, []);

  const cancelDownloading = useCallback(() => {
    setDownloadingState({
      isDownloading: false,
      progress: 0,
      bookTitle: '',
      currentBookId: null
    });
  }, []);

  return {
    downloadingState,
    startDownloading,
    updateProgress,
    finishDownloading,
    cancelDownloading
  };
};
