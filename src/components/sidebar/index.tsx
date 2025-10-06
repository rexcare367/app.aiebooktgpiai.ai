// src/pages/sidebar/index.tsx
import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import { sideMenu } from "../../constants/sideMenu";
import { useHistory, useLocation } from "react-router-dom";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import { X, LogOut, Globe, Settings, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import i18n from "../../i18n";
import { langList } from "../../constants/settingList";
import {
  handleMode,
  handleSearch,
  handleSortDisplay,
  handleCollapse,
  handleSelectBook,
  handleShelfIndex,
  handleShelf,
  handleSearchResults,
  handleSearchKeyword,
  handleSidebar,
  handleSetting,
} from "../../store/actions";
import { connect } from "react-redux";
import { stateType } from "../../store";
import { withTranslation } from "react-i18next";

export interface SidebarProps {
  mode: string;
  isCollapsed: boolean;
  shelfIndex: number;
  shelf: string;
  isSidebarShow: boolean;

  handleMode: (mode: string) => void;
  handleSearch: (isSearch: boolean) => void;
  handleCollapse: (isCollapsed: boolean) => void;
  handleSortDisplay: (isSortDisplay: boolean) => void;
  handleSelectBook: (isSelectBook: boolean) => void;
  handleShelfIndex: (shelfIndex: number) => void;
  handleShelf: (shelf: string) => void;
  t: (title: string) => string;
  handleSearchKeyword: (keyword: string) => void;
  handleSearchResults: (results: any[]) => void;
  handleSidebar: (isSidebarShow: boolean) => void;
  handleSetting: (isSettingOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = memo((props) => {
  const { signOut } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const [isCollapsed] = useState<boolean>(StorageUtil.getReaderConfig("isCollapsed") === "yes" || false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const handleSidebarSelect = useCallback((mode: string, menuIndex: number) => {
    // Batch all state updates for better performance
    const stateUpdates = [
      () => props.handleSelectBook(false),
      () => props.handleMode(mode),
      () => props.handleShelfIndex(-1),
      () => props.handleShelf(""),
      () => props.handleSearch(false),
      () => props.handleSortDisplay(false),
    ];

    // Execute all state updates
    stateUpdates.forEach(update => update());

    // Navigate to the new page
    history.push(`/manager/${mode}`);

    // Auto-hide sidebar on mobile after navigation
    if (isMobile) {
      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        props.handleSidebar(false);
      });
    }
  }, [history, isMobile, props]);

  const handleJump = useCallback((url: string) => {
    openExternalUrl(url);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut]);

  // Memoize current path calculation for performance
  const currentPath = useMemo(() => {
    const pathFromRouter = location.pathname || "";
    const pathFromHash =
      typeof window !== "undefined" && (window as any).location && (window as any).location.hash
        ? (window as any).location.hash.replace(/^#/, "")
        : "";
    return pathFromRouter || pathFromHash;
  }, [location.pathname]);

  // Memoize sidebar menu items for better performance
  const sidebarMenuItems = useMemo(() => {
    return sideMenu.map((item, menuIndex) => {
      const isActive = currentPath === `/manager/${item.mode}` && props.mode !== "shelf";
      
      return (
        <li
          key={item.name}
          className={`
            side-menu-item-hover
            mt-0.5 mb-[3px] list-none text-[15px] w-full cursor-pointer 
            overflow-hidden whitespace-nowrap text-ellipsis relative bottom-px
            transition-all duration-100
            ${isActive ? "rounded-r-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "hover:rounded-r-full text-gray-800 dark:text-gray-200"}
            ${props.isCollapsed ? "!w-10 !ml-[15px]" : "-ml-5"}
          `}
          id={`sidebar-${item.icon}`}
          onClick={() => handleSidebarSelect(item.mode, menuIndex)}
        >
          <div 
            className={`side-menu-selector-hover w-full h-[39px] leading-[39px] z-40 flex items-center font-medium ${
              isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent'
            }`}
          >
            <div 
              className={`text-[22px] my-[9px_12px_7px] mx-3 flex justify-center items-center w-[30px] ${!props.isCollapsed ? "ml-[38px]" : ""}`}
            >
              {item.icon}
            </div>
            <span className={props.isCollapsed ? "hidden w-[70%]" : "w-[60%]"}>
              {props.t(item.name)}
            </span>
          </div>
        </li>
      );
    });
  }, [currentPath, props.mode, props.isCollapsed, props.t, handleSidebarSelect]);

  // Memoize language options for better performance
  const languageOptions = useMemo(() => {
    return langList.map((item) => (
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    ));
  }, []);

  // Memoize current language value
  const currentLanguage = useMemo(() => {
    return StorageUtil.getReaderConfig("lang");
  }, []);

  // Optimized language change handler
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    i18n.changeLanguage(newLanguage);
    StorageUtil.setReaderConfig("lang", newLanguage);
    window.location.reload();
  }, []);

  // Theme toggle handler using Tailwind dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or default to light mode
    const savedTheme = StorageUtil.getReaderConfig("appSkin");
    if (savedTheme === "night" || savedTheme === "dark") {
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  });

  const handleThemeToggle = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      StorageUtil.setReaderConfig("appSkin", "night");
    } else {
      document.documentElement.classList.remove('dark');
      StorageUtil.setReaderConfig("appSkin", "light");
    }
  }, [isDarkMode]);

  // Memoize settings button handler
  const handleSettingsClick = useCallback(() => {
    props.handleSetting(true);
  }, [props]);

  // Memoize sidebar toggle handlers
  const handleShowSidebar = useCallback(() => {
    props.handleSidebar(true);
  }, [props]);

  const handleHideSidebar = useCallback(() => {
    props.handleSidebar(false);
  }, [props]);

  return (
    <>
      {/* Custom styles for hover effects using Tailwind */}
      <style>{`
        .side-menu-item-hover:hover {
          background-color: rgb(239 246 255) !important; /* bg-blue-50 */
          color: rgb(37 99 235) !important; /* text-blue-600 */
        }
        .dark .side-menu-item-hover:hover {
          background-color: rgb(30 58 138 / 0.2) !important; /* bg-blue-900/20 */
          color: rgb(96 165 250) !important; /* text-blue-400 */
        }
        .side-menu-item-hover:hover .side-menu-selector-hover {
          background-color: rgb(239 246 255) !important; /* bg-blue-50 */
        }
        .dark .side-menu-item-hover:hover .side-menu-selector-hover {
          background-color: rgb(30 58 138 / 0.2) !important; /* bg-blue-900/20 */
        }
      `}</style>

      {/* Mobile hamburger menu button - always visible when sidebar is hidden */}
      {isMobile && !props.isSidebarShow && (
        <div
          className="fixed top-1 left-1 z-50 cursor-pointer p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          onClick={handleShowSidebar}
        >
          <Menu className="w-5 h-5" />
        </div>
      )}

      <div
        className={`h-full w-fit z-50 bg-white dark:bg-gray-800 ${
          isMobile && props.isSidebarShow && "absolute top-0 left-0 border-r-2 border-solid border-gray-200 dark:border-gray-700"
        } ${isMobile && !props.isSidebarShow && "hidden"}`}
      >
        <div className="flex justify-center items-center gap-3">
          {isMobile && props.isSidebarShow && (
            <div
              className="relative cursor-pointer text-xl flex justify-center items-center text-gray-800 dark:text-gray-200"
              onClick={handleHideSidebar}
            >
              <X className="w-4" />
            </div>
          )}

          <img
            src={
              StorageUtil.getReaderConfig("appSkin") === "night" ||
              (StorageUtil.getReaderConfig("appSkin") === "system" &&
                StorageUtil.getReaderConfig("isOSNight") === "yes")
                ? "./assets/label_light.png"
                : "./assets/label.png"
            }
            alt=""
            onClick={(e) => {
              e.preventDefault();
              handleJump("/");
            }}
            className={`mr-3 w-32 relative cursor-pointer ${isCollapsed ? "hidden" : ""}`}
          />
        </div>
        <div
          className={`
            relative w-[210px] h-[calc(100%-100px)] overflow-x-hidden top-[30px]
            scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-600
            ${isCollapsed ? "!w-[70px]" : ""}
          `}
        >
          <div>{sidebarMenuItems}</div>

          {/* Language Selector */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{props.t("Language")}</span>
              </div>
              <select
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                value={currentLanguage}
                onChange={handleLanguageChange}
              >
                {languageOptions}
              </select>
            </div>

            {/* Theme Toggle */}
            <div
              className="flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 mb-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-blue-600 dark:text-yellow-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  { isDarkMode ? (props.t("Dark Mode")) : (props.t("Light Mode"))}
                </span>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="w-3 h-3 text-blue-600 m-0.5" />
                  ) : (
                    <Sun className="w-3 h-3 text-yellow-500 m-0.5" />
                  )}
                </span>
              </button>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer mb-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{props.t("Settings")}</span>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{props.t("Sign Out")}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

// Add display name for better debugging
Sidebar.displayName = 'Sidebar';

// Memoize mapStateToProps for better performance
const mapStateToProps = (state: stateType) => ({
  mode: state.sidebar.mode,
  isCollapsed: state.sidebar.isCollapsed,
  shelfIndex: state.sidebar.shelfIndex,
  shelf: state.sidebar.shelf,
  isSidebarShow: state.manager.isSidebarShow,
});

// Optimized action creators object
const actionCreator = {
  handleMode,
  handleSearch,
  handleSortDisplay,
  handleCollapse,
  handleSelectBook,
  handleShelfIndex,
  handleShelf,
  handleSearchResults,
  handleSearchKeyword,
  handleSidebar,
  handleSetting,
};

export default connect(mapStateToProps, actionCreator)(withTranslation()(Sidebar as any) as any);
