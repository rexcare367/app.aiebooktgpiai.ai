// src/pages/sidebar/index.tsx
import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import "./sidebar.css";
import { sideMenu } from "../../constants/sideMenu";
import { useHistory, useLocation } from "react-router-dom";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import { X, LogOut, Globe, Settings, Menu } from "lucide-react";
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
          className={`side-menu-item ${
            isActive ? "rounded-r-full" : "hover:rounded-r-full"
          }`}
          id={`sidebar-${item.icon}`}
          onClick={() => handleSidebarSelect(item.mode, menuIndex)}
          style={{
            ...(props.isCollapsed ? { width: 40, marginLeft: 15 } : {}),
            backgroundColor: isActive ? 'var(--active-theme-light)' : 'transparent',
            color: isActive ? 'var(--active-theme-color)' : 'var(--text-color)'
          }}
        >
          <div 
            className="side-menu-selector"
            style={{
              backgroundColor: isActive ? 'var(--active-theme-light)' : 'transparent'
            }}
          >
            <div className="side-menu-icon" style={props.isCollapsed ? {} : { marginLeft: "38px" }}>
              {item.icon}
            </div>
            <span style={props.isCollapsed ? { display: "none", width: "70%" } : { width: "60%" }}>
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
      {/* Mobile hamburger menu button - always visible when sidebar is hidden */}
      {isMobile && !props.isSidebarShow && (
        <div
          className="fixed top-1 left-1 z-50 cursor-pointer p-1 rounded-md"
          style={{
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)'
          }}
          onClick={handleShowSidebar}
        >
          <Menu className="w-5 h-5" />
        </div>
      )}

      <div
        className={`h-full w-fit z-50 ${
          isMobile && props.isSidebarShow && "absolute top-0 left-0  border-r-2 border-solid"
        } ${isMobile && !props.isSidebarShow && "hidden"}`}
        style={{
          backgroundColor: 'var(--bg-color)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex justify-center items-center gap-3">
          {isMobile && props.isSidebarShow && (
            <div
              className="relative cursor-pointer text-xl flex justify-center items-center"
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
            style={isCollapsed ? { display: "none" } : {}}
            className="mr-3 w-32 relative cursor-pointer"
          />
        </div>
        <div
          className="side-menu-container-parent w-[210px] h-[calc(100%-100px)] overflow-x-hidden overflow-y-scroll relative top-[30px] "
          style={isCollapsed ? { width: "70px" } : {}}
        >
          <div className="sidebar-menu">{sidebarMenuItems}</div>

          {/* Language Selector */}
          <div className="sidebar-footer">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4" style={{ color: 'var(--active-theme-color)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{props.t("Language")}</span>
              </div>
              <select
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)'
                }}
                value={currentLanguage}
                onChange={handleLanguageChange}
              >
                {languageOptions}
              </select>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer mb-2"
              style={{
                backgroundColor: 'var(--active-theme-light)',
                color: 'var(--active-theme-color)'
              }}
              onClick={handleSettingsClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--active-theme-color)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--active-theme-light)';
                e.currentTarget.style.color = 'var(--active-theme-color)';
              }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{props.t("Settings")}</span>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--active-theme-light)',
                color: 'var(--active-theme-color)',
              }}
              onClick={handleSignOut}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--active-theme-color)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--active-theme-light)';
                e.currentTarget.style.color = 'var(--active-theme-color)';
              }}
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
