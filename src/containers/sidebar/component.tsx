import React from "react";
import "./sidebar.css";
import { sideMenu } from "../../constants/sideMenu";
import { SidebarProps, SidebarState } from "./interface";
import { withRouter } from "react-router-dom";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import ShelfUtil from "../../utils/readUtils/shelfUtil";
import { Trans } from "react-i18next";
import { X } from "lucide-react";

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
    const renderSideShelf = (shelfList: any, shelfType: string) => {
      return shelfList.map((item, index) => {
        const shelf = `${shelfType}-${item}`;
        return (
          <li
            key={item}
            className={this.props.shelf === shelf ? "active side-menu-item" : "side-menu-item"}
            id={`sidebar-${index}`}
            onClick={() => {
              this.props.handleShelf(shelf);
              this.props.handleShelfIndex(index);
              this.props.handleMode("shelf");
              this.setState({ index: -1 });
              this.props.history.push("/manager/shelf");
            }}
            onMouseEnter={() => {
              this.handleShelfHover(shelf);
            }}
            onMouseLeave={() => {
              this.handleShelfHover("");
            }}
            style={this.props.isCollapsed ? { width: 40, marginLeft: 15 } : {}}
          >
            {this.props.shelf === shelf ? <div className="side-menu-selector-container"></div> : null}
            {this.state.hoverShelf === shelf ? <div className="side-menu-hover-container"></div> : null}
            <div className={this.props.shelf === shelf ? "side-menu-selector active-selector" : "side-menu-selector "}>
              <div className="side-menu-icon" style={this.props.isCollapsed ? {} : { marginLeft: "38px" }}>
                <span
                  className={
                    this.props.shelf === shelf
                      ? `icon-bookshelf-line  active-icon sidebar-shelf-icon`
                      : `icon-bookshelf-line sidebar-shelf-icon`
                  }
                  style={this.props.isCollapsed ? { position: "relative", marginLeft: "-8px" } : {}}
                ></span>
              </div>

              <span style={this.props.isCollapsed ? { display: "none", width: "70%" } : { width: "60%" }}>
                {this.props.t(item)}
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
            <ul className="side-menu-container">{renderSideMenu()}</ul>
            <div
              className="side-shelf-title-container"
              style={
                this.state.isCollapsed ? { display: "none" } : this.state.isCollpaseShelf ? {} : { border: "none" }
              }
            >
              <div className="side-shelf-title">
                <Trans>Shelf</Trans>
              </div>
              <span
                className="icon-dropdown side-shelf-title-icon"
                onClick={() => {
                  this.setState({
                    isCollpaseShelf: !this.state.isCollpaseShelf,
                  });
                }}
                style={this.state.isCollpaseShelf ? { transform: "rotate(-90deg)" } : {}}
              ></span>
            </div>

            {!this.state.isCollpaseShelf && (
              <ul className="side-shelf-container">{renderSideShelf(this.shelfList, "genres")}</ul>
            )}
            <div
              className="side-shelf-title-container"
              style={
                this.state.isCollapsed ? { display: "none" } : this.state.isCollpaseLanguages ? {} : { border: "none" }
              }
            >
              <div className="side-shelf-title">
                <Trans>Languages</Trans>
              </div>
              <span
                className="icon-dropdown side-shelf-title-icon"
                onClick={() => {
                  this.setState({
                    isCollpaseLanguages: !this.state.isCollpaseLanguages,
                  });
                }}
                style={this.state.isCollpaseLanguages ? { transform: "rotate(-90deg)" } : {}}
              ></span>
            </div>

            {!this.state.isCollpaseLanguages && (
              <ul className="side-shelf-container">{renderSideShelf(this.languageList, "lang")}</ul>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Sidebar as any);
