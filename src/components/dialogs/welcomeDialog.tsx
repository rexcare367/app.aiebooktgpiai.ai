import React, { useEffect, useState } from "react";

interface WelcomeDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-[400px] space-y-4">
        <div className="text-center space-y-2">
          <img
            src="/assets/placeholder_image.svg"
            alt="Welcome"
            className="w-24 h-24 mx-auto"
          />
          <h2 className="text-2xl font-bold">Welcome to eBook Reader!</h2>
          <p className="text-gray-600">Enjoy your reading experience.</p>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDialog; 