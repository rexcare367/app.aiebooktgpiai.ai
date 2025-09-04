import React, { useState } from 'react';
import DownloadingLoader from './DownloadingLoader';

const DownloadingLoaderDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState('Sample Book Title');

  const startDemo = () => {
    setIsVisible(true);
    setProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setProgress(0);
          }, 1000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Downloading Loader Demo</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Book Title:</label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter book title"
          />
        </div>
        
        <button
          onClick={startDemo}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Download Demo
        </button>
        
        <div className="text-sm text-gray-600">
          <p>Click the button above to see the downloading loader in action.</p>
          <p>The loader will show progress from 0% to 100% and then disappear.</p>
        </div>
      </div>

      <DownloadingLoader
        isVisible={isVisible}
        bookTitle={bookTitle}
        progress={progress}
        onCancel={() => {
          setIsVisible(false);
          setProgress(0);
        }}
      />
    </div>
  );
};

export default DownloadingLoaderDemo;
