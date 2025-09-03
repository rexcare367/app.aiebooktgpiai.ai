import StorageUtil from "./storageUtil";
import ManagerUtil from "../fileUtils/managerUtil";

class ThemeToggleUtil {
  static toggleTheme = () => {
    const currentSkin = StorageUtil.getReaderConfig("appSkin");
    let newSkin: string;

    if (currentSkin === "light") {
      newSkin = "night";
    } else if (currentSkin === "night") {
      newSkin = "light";
    } else {
      // If it's "system", toggle to light first
      newSkin = "light";
    }

    StorageUtil.setReaderConfig("appSkin", newSkin);

    // Update background and text colors
    if (newSkin === "night") {
      StorageUtil.setReaderConfig("backgroundColor", "rgba(44,47,49,1)");
      StorageUtil.setReaderConfig("textColor", "rgba(255,255,255,1)");
    } else {
      StorageUtil.setReaderConfig("backgroundColor", "rgba(255,255,255,1)");
      StorageUtil.setReaderConfig("textColor", "rgba(0,0,0,1)");
    }

    // Apply theme CSS immediately
    ThemeToggleUtil.applyThemeCSS(newSkin);

    // Reload the manager to apply theme changes
    ManagerUtil.reloadManager();
  };

  static applyThemeCSS = (skin: string) => {
    // Remove existing theme stylesheets
    const existingStyles = document.querySelectorAll('link[href*="assets/styles/"]');
    existingStyles.forEach(style => style.remove());

    // Add new theme stylesheet
    const style = document.createElement("link");
    style.rel = "stylesheet";
    
    if (skin === "night") {
      style.href = "./assets/styles/dark.css";
    } else {
      style.href = "./assets/styles/default.css";
    }
    
    document.head.appendChild(style);
  };

  static getCurrentTheme = (): "light" | "dark" => {
    const appSkin = StorageUtil.getReaderConfig("appSkin");
    const isOSNight = StorageUtil.getReaderConfig("isOSNight") === "yes";

    if (appSkin === "night" || (appSkin === "system" && isOSNight)) {
      return "dark";
    }
    return "light";
  };

  static getThemeIcon = (): string => {
    const currentTheme = ThemeToggleUtil.getCurrentTheme();
    return currentTheme === "dark" ? "☀️" : "🌙";
  };
}

export default ThemeToggleUtil;
