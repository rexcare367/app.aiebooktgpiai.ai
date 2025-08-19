import React from "react";
import "./sidebar.css";
import { sideMenu } from "../../constants/sideMenu";
import { SidebarProps, SidebarState } from "./interface";
import { withRouter } from "react-router-dom";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import ShelfUtil from "../../utils/readUtils/shelfUtil";
import { Trans } from "react-i18next";
import { X, LogOut, Globe } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import i18n from "../../i18n";
import { langList } from "../../constants/settingList";

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      index: 0,
      hoverIndex: -1,
      hoverShelf: "",
      isCollpaseShelf: false,
      isCollpaseLanguages: false,
      isOpenDelete: false,
      shelfIndex: 0,
      isCollapsed: StorageUtil.getReaderConfig("isCollapsed") === "yes" || false,
      isMobile: window.innerWidth <= 768,
      isHide: true,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      isMobile: window.innerWidth <= 768,
    });
  };

  shelfList = ["Comics", "Storybooks", "History", "Moral Education", "Biographies", "Popular Science"];

  languageList = ["Malay", "English", "Mandarin"];

  handleSidebar = (mode: string, index: number) => {
    this.setState({ index: index });
    this.props.handleSelectBook(false);

    this.props.history.push(`/manager/${mode}`);

    this.props.handleMode(mode);
    this.props.handleShelfIndex(-1);
    this.props.handleShelf("");
    this.props.handleSearch(false);
    this.props.handleSortDisplay(false);
  };

  handleHover = (index: number) => {
    this.setState({ hoverIndex: index });
  };
  handleShelfHover = (shelf: string) => {
    this.setState({ hoverShelf: shelf });
  };
  handleCollapse = (isCollapsed: boolean) => {
    this.setState({ isCollapsed });
    this.props.handleCollapse(isCollapsed);
    StorageUtil.setReaderConfig("isCollapsed", isCollapsed ? "yes" : "no");
  };
  handleHide = (isHide: boolean) => {
    this.setState({ isHide });
  };
  handleJump = (url: string) => {
    openExternalUrl(url);
  };
  handleDeleteShelf = () => {
    if (this.state.shelfIndex < 1) return;
    let shelfTitles = Object.keys(ShelfUtil.getShelf());
    let currentShelfTitle = shelfTitles[this.state.shelfIndex];
    ShelfUtil.removeShelf(currentShelfTitle);
    this.setState({ shelfIndex: 0 }, () => {
      this.props.handleShelfIndex(0);
      this.props.handleMode("shelf");
    });
  };

  handleSignOut = async () => {
    try {
      const { signOut } = useAuth();
      await signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  render() {
    const renderSideMenu = () => {
      return sideMenu.map((item, index) => {
        return (
          <li
            key={item.name}
            className={
              this.state.index === index && this.props.mode !== "shelf" ? "active side-menu-item" : "side-menu-item"
            }
            id={`sidebar-${item.icon}`}
            onClick={() => {
              this.handleSidebar(item.mode, index);
            }}
            onMouseEnter={() => {
              this.handleHover(index);
            }}
            onMouseLeave={() => {
              this.handleHover(-1);
            }}
            style={this.props.isCollapsed ? { width: 40, marginLeft: 15 } : {}}
          >
            {this.state.index === index && this.props.mode !== "shelf" ? (
              <div className="side-menu-selector-container"></div>
            ) : null}
            {this.state.hoverIndex === index ? <div className="side-menu-hover-container"></div> : null}
            <div
              className={
                this.state.index === index && this.props.mode !== "shelf"
                  ? "side-menu-selector active-selector"
                  : "side-menu-selector "
              }
            >
              <div className="side-menu-icon" style={this.props.isCollapsed ? {} : { marginLeft: "38px" }}>
                {item.icon}
              </div>

              <span style={this.props.isCollapsed ? { display: "none", width: "70%" } : { width: "60%" }}>
                {this.props.t(item.name)}
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
            this.state.isMobile &&
            this.props.isSidebarShow &&
            "absolute top-0 left-0  border-r-2 border-solid border-gray-main-bg"
          } ${this.state.isMobile && !this.props.isSidebarShow && "hidden"}`}
        >
          <div className="flex justify-center items-center gap-3">
            {this.state.isMobile && (
              <div
                className="relative cursor-pointer text-xl flex justify-center items-center"
                onClick={() => {
                  this.props.handleSidebar(!this.props.isSidebarShow);
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
                this.handleJump("/");
              }}
              style={this.state.isCollapsed ? { display: "none" } : {}}
              className="mr-3 w-32 relative cursor-pointer"
            />
          </div>
          <div
            className="side-menu-container-parent w-[210px] h-[calc(100%-100px)] overflow-x-hidden overflow-y-scroll relative top-[30px] "
            style={this.state.isCollapsed ? { width: "70px" } : {}}
          >
            <div className="sidebar-menu">{renderSideMenu()}</div>

            {/* Language Selector */}
            <div className="sidebar-footer">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">{this.props.t("Language")}</span>
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
                onClick={this.handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{this.props.t("Sign Out")}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Sidebar as any);
