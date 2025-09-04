import React from "react";
import "./profilePage.css";
// import { Trans } from "react-i18next";
import { ProfilePageProps, ProfilePageState } from "./interface";
import ReadingStatsSection from "./ReadingStats/ReadingStatsSection";
import ProfileInfoSection from "./ProfileInfo/ProfileInfoSection";
import Manager from "../manager";

class ProfilePage extends React.Component<ProfilePageProps, ProfilePageState> {
  constructor(props: ProfilePageProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Manager>
        <div className="profile-page-container">
          <div className="profile-banner">
            <img src="/assets/banner.jpg" alt="Profile banner" />
          </div>
          <div className="profile-split-container">
            <div className="left-column">
              <ProfileInfoSection />
            </div>
            <div className="right-column">
              <ReadingStatsSection />
            </div>
          </div>
        </div>
      </Manager>
    );
  }
}

export default ProfilePage;
