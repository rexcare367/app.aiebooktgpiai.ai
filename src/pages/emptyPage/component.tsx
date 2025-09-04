import React from "react";
import "./emptyPage.css";
import { emptyList } from "../../constants/emptyList";
import { Trans } from "react-i18next";
import { EmptyPageProps } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";

const EmptyPage: React.FC<EmptyPageProps> = ({ mode, isCollapsed }) => {
  const isDarkMode =
    StorageUtil.getReaderConfig("appSkin") === "night" ||
    (StorageUtil.getReaderConfig("appSkin") === "system" && StorageUtil.getReaderConfig("isOSNight") === "yes");

  return (
    <div className="empty-page-container">
      <div className="empty-content">
        <div className="empty-illustration">
          <img
            src={isDarkMode ? "./assets/empty_light.svg" : "./assets/empty.svg"}
            alt=""
            className="empty-page-illustration"
          />
          <p className="empty-description">No items to display</p>
        </div>

        <div className="empty-messages">
          {emptyList.map((item) => (
            <div className={`empty-message ${mode === item.mode ? "active" : ""}`} key={item.mode}>
              <h2 className="empty-title">
                <Trans>{item.main}</Trans>
              </h2>
              <p className="empty-subtitle">
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
