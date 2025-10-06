import { isElectron } from "react-device-detect";
import StorageUtil from "./storageUtil";

export const initTheme = () => {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  let isNight = false;
  if (isElectron) {
    const { ipcRenderer } = window.require("electron");
    isNight = ipcRenderer.sendSync("system-color");
  } else {
    isNight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  StorageUtil.setReaderConfig("isOSNight", isNight ? "yes" : "no");
  if (!StorageUtil.getReaderConfig("appSkin")) {
    StorageUtil.setReaderConfig("appSkin", "system");
    if (isNight) {
    }
  }
  
  // Apply Tailwind dark mode class
  const appSkin = StorageUtil.getReaderConfig("appSkin");
  if (
    appSkin === "night" ||
    appSkin === "dark" ||
    (appSkin === "system" && StorageUtil.getReaderConfig("isOSNight") === "yes")
  ) {
    document.documentElement.classList.add('dark');
    style.href = "./assets/styles/dark.css";
  } else {
    document.documentElement.classList.remove('dark');
    style.href = "./assets/styles/default.css";
  }
  document.head.appendChild(style);
};
export const initSystemFont = () => {
  if (StorageUtil.getReaderConfig("systemFont")) {
    let body = document.getElementsByTagName("body")[0];
    body.setAttribute(
      "style",
      "font-family:" + StorageUtil.getReaderConfig("systemFont") + "!important"
    );
  }
};
