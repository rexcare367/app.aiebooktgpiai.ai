import React from "react";
import { emptyList } from "../../constants/emptyList";
import { Trans } from "react-i18next";
import { EmptyPageProps } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";

const EmptyPage: React.FC<EmptyPageProps> = ({ mode, isCollapsed }) => {
  const isDarkMode =
    StorageUtil.getReaderConfig("appSkin") === "night" ||
    (StorageUtil.getReaderConfig("appSkin") === "system" && StorageUtil.getReaderConfig("isOSNight") === "yes");

  return (
    <div className="flex justify-center items-center min-h-screen transition-all duration-300 dark:from-gray-900 dark:to-gray-800" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)' }}>
      <div className="flex flex-col items-center gap-8 p-8 md:p-4 max-w-[1200px] w-full">
        <div className="relative w-full max-w-[500px] h-[300px] md:h-[250px] sm:h-[200px] mb-4">
          <img
            src={isDarkMode ? "./assets/empty_light.svg" : "./assets/empty.svg"}
            alt=""
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
          />
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 font-medium text-center opacity-80">No items to display</p>
        </div>

        <div className="text-center w-full max-w-[600px]">
          {emptyList.map((item) => (
            <div 
              className={`transition-all duration-300 ${
                mode === item.mode 
                  ? 'opacity-100 visible translate-y-0 relative' 
                  : 'opacity-0 invisible translate-y-5 absolute w-full'
              }`} 
              key={item.mode}
            >
              <h2 className="text-4xl md:text-3xl sm:text-[1.75rem] font-bold text-gray-800 dark:text-gray-200 mb-4" style={{ 
                background: 'linear-gradient(120deg, #2d3748 0%, #4a5568 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <Trans>{item.main}</Trans>
              </h2>
              <p className="text-xl md:text-lg sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed m-0 font-normal">
                <Trans>{item.sub}</Trans>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;
