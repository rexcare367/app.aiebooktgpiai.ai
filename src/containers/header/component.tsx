import React from "react";
import "./header.css";
import SearchBox from "../../components/searchBox";
import ChatbotDialog from "../../components/dialogs/chatbotDialog";
import { HeaderProps, HeaderState } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
// import UpdateInfo from "../../components/dialogs/updateDialog";
import UserPanelDialog from "../../components/dialogs/userPanelDialog";
import { restore } from "../../utils/syncUtils/restoreUtil";
import { backup } from "../../utils/syncUtils/backupUtil";
import { syncData } from "../../utils/syncUtils/common";
import toast from "react-hot-toast";
// import { checkStableUpdate } from "../../utils/commonUtil";
// import packageInfo from "../../../package.json";
import { langList } from "../../constants/settingList";
import i18n from "../../i18n";
import { openExternalUrl } from "../../utils/serviceUtils/urlUtil";
import { AlignJustify } from "lucide-react";

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      isOnlyLocal: false,
      language: StorageUtil.getReaderConfig("lang") || "en",
      isNewVersion: false,
      width: document.body.clientWidth,
      isdataChange: false,
      isDeveloperVer: false,
      user: "",
      isMobile: window.innerWidth <= 768,
    };
  }
  async componentDidMount() {
    window.addEventListener("resize", () => {
      this.setState({ width: document.body.clientWidth });
    });
    window.addEventListener("focus", () => {
      this.props.handleFetchBooks();
      this.props.handleFetchNotes();
      this.props.handleFetchBookmarks();
    });
  }

  syncFromLocation = async () => {
    const fs = window.require("fs");
    const path = window.require("path");
    const { zip } = window.require("zip-a-folder");
    let storageLocation = localStorage.getItem("storageLocation")
      ? localStorage.getItem("storageLocation")
      : window.require("electron").ipcRenderer.sendSync("storage-location", "ping");
    let sourcePath = path.join(storageLocation, "config");
    let outPath = path.join(storageLocation, "config.zip");
    await zip(sourcePath, outPath);

    var data = fs.readFileSync(outPath);

    let blobTemp = new Blob([data], { type: "application/epub+zip" });
    let fileTemp = new File([blobTemp], "config.zip", {
      lastModified: new Date().getTime(),
      type: blobTemp.type,
    });
    let result = await restore(fileTemp, true);
    if (result) {
      this.setState({ isdataChange: false });
      //Check for data update
      let storageLocation = localStorage.getItem("storageLocation")
        ? localStorage.getItem("storageLocation")
        : window.require("electron").ipcRenderer.sendSync("storage-location", "ping");
      let sourcePath = path.join(storageLocation, "config", "readerConfig.json");

      fs.readFile(sourcePath, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        const readerConfig = JSON.parse(data);
        if (localStorage.getItem("lastSyncTime") && readerConfig.lastSyncTime) {
          localStorage.setItem("lastSyncTime", readerConfig.lastSyncTime);
        }
      });
    }
    if (!result) {
      toast.error(this.props.t("Sync Failed"));
    } else {
      toast.success(this.props.t("Synchronisation successful"));
    }
  };
  handleSync = () => {
    if (StorageUtil.getReaderConfig("isFirst") !== "no") {
      this.props.handleTipDialog(true);
      this.props.handleTip(
        "Sync function works with third-party cloud drive. You need to manually change the storage location to the same sync folder on different computers. When you click the sync button, AI eBook Library Tanjung Piai will automatically upload or download the data from this folder according the timestamp."
      );
      StorageUtil.setReaderConfig("isFirst", "no");
      return;
    }
    const fs = window.require("fs");
    const path = window.require("path");
    let storageLocation = localStorage.getItem("storageLocation")
      ? localStorage.getItem("storageLocation")
      : window.require("electron").ipcRenderer.sendSync("storage-location", "ping");
    let sourcePath = path.join(storageLocation, "config", "readerConfig.json");
    fs.readFile(sourcePath, "utf8", async (err, data) => {
      if (err || !data) {
        this.syncToLocation();
        return;
      }
      const readerConfig = JSON.parse(data);

      if (
        readerConfig &&
        localStorage.getItem("lastSyncTime") &&
        parseInt(readerConfig.lastSyncTime) > parseInt(localStorage.getItem("lastSyncTime")!)
      ) {
        this.syncFromLocation();
      } else {
        this.syncToLocation();
      }
    });
  };
  syncToLocation = async () => {
    let timestamp = new Date().getTime().toString();
    StorageUtil.setReaderConfig("lastSyncTime", timestamp);
    localStorage.setItem("lastSyncTime", timestamp);
    let result = await backup(this.props.books, this.props.notes, this.props.bookmarks, true);
    if (!result) {
      toast.error(this.props.t("Sync Failed"));
    } else {
      syncData(result as Blob, this.props.books, true);
      toast.success(this.props.t("Synchronisation successful"));
    }
  };

  changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    StorageUtil.setReaderConfig("lang", lng);
    this.setState({ language: lng });
  };

  handleJump = (url: string) => {
    openExternalUrl(url);
  };

  render() {
    return (
      <div className={`header`}>
        <div className="flex flex-row items-center">
          {this.state.isMobile && (
            <div
              className="h-full w-fit px-1 md:mr-4"
              onClick={() => {
                this.props.handleSidebar(true);
              }}
            >
              <AlignJustify className="w-4" />
            </div>
          )}
          <div className="relative min-w-[120px] md:min-w-[200px] max-w-[400px]  flex">
            <SearchBox />
          </div>
        </div>

        <div className="header-controls flex md:flex-row flex-col-reverse items-end">
          <div className="right-controls">
            <div className="language-selector rounded-md">
              <span className="current-language">
                {this.state.language === "en" && "English"}
                {this.state.language === "myML" && "Malay"}
                {this.state.language === "myMN" && "中文"}
                {this.state.language === "myTM" && "தமிழ்"}
              </span>
              <div className="language-menu">
                {langList.map((item) => (
                  <div
                    key={item.value}
                    className={`language-option ${this.state.language === item.value ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.changeLanguage(item.value);
                    }}
                  >
                    {item.value === "en" && "English"}
                    {item.value === "myML" && "Malay"}
                    {item.value === "myMN" && "中文"}
                    {item.value === "myTM" && "தமிழ்"}
                  </div>
                ))}
              </div>
            </div>
            <UserPanelDialog />
          </div>
        </div>
        {/* <UpdateInfo /> */}
        <ChatbotDialog />
      </div>
    );
  }
}

export default Header;
