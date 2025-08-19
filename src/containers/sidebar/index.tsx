// src/containers/sidebar/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import "./sidebar.css";
import { sideMenu } from "../../constants/sideMenu";
import { useHistory, useLocation } from "react-router-dom";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import { X, LogOut, Globe } from "lucide-react";
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
}

const Sidebar: React.FC<SidebarProps> = (props) => {
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

  const handleSidebarSelect = (mode: string, menuIndex: number) => {
    props.handleSelectBook(false);

    history.push(`/manager/${mode}`);

    props.handleMode(mode);
    props.handleShelfIndex(-1);
    props.handleShelf("");
    props.handleSearch(false);
    props.handleSortDisplay(false);
  };

  const handleJump = (url: string) => {
    openExternalUrl(url);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const renderSideMenu = () => {
    return sideMenu.map((item, menuIndex) => {
      const pathFromRouter = location.pathname || "";
      const pathFromHash =
        typeof window !== "undefined" && (window as any).location && (window as any).location.hash
          ? (window as any).location.hash.replace(/^#/, "")
          : "";
      const currentPath = pathFromRouter || pathFromHash;
      const isActive = currentPath === `/manager/${item.mode}` && props.mode !== "shelf";
      return (
        <li
          key={item.name}
          className={`side-menu-item ${
            isActive ? "bg-indigo-50 text-indigo-700 rounded-r-full" : "hover:bg-gray-50 hover:rounded-r-full"
          }`}
          id={`sidebar-${item.icon}`}
          onClick={() => {
            handleSidebarSelect(item.mode, menuIndex);
          }}
          style={props.isCollapsed ? { width: 40, marginLeft: 15 } : {}}
        >
          <div className={`side-menu-selector ${isActive ? "bg-indigo-100" : ""}`}>
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
  };

  return (
    <>
      <div
        className={`h-full w-fit bg-white z-50 ${
          isMobile && props.isSidebarShow && "absolute top-0 left-0  border-r-2 border-solid border-gray-main-bg"
        } ${isMobile && !props.isSidebarShow && "hidden"}`}
      >
        <div className="flex justify-center items-center gap-3">
          {isMobile && (
            <div
              className="relative cursor-pointer text-xl flex justify-center items-center"
              onClick={() => {
                props.handleSidebar(!props.isSidebarShow);
              }}
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
          <div className="sidebar-menu">{renderSideMenu()}</div>

          {/* Language Selector */}
          <div className="sidebar-footer">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">{props.t("Language")}</span>
              </div>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                value={StorageUtil.getReaderConfig("lang")}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  StorageUtil.setReaderConfig("lang", e.target.value);
                  window.location.reload();
                }}
              >
                {langList.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full font-medium transition-colors duration-200"
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
};

const mapStateToProps = (state: stateType) => {
  return {
    mode: state.sidebar.mode,
    isCollapsed: state.sidebar.isCollapsed,
    shelfIndex: state.sidebar.shelfIndex,
    shelf: state.sidebar.shelf,
    isSidebarShow: state.manager.isSidebarShow,
  };
};

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
};

export default connect(mapStateToProps, actionCreator)(withTranslation()(Sidebar as any) as any);
