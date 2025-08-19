import React from "react";
import "./profilePage.css";
// import { Trans } from "react-i18next";
import { ProfilePageProps, ProfilePageState } from "./interface";
import ReadingProgressSection from "./readingProgress/readingProgress";
import ProfileInformationSection from "./profileInformation/profileInformation";
import Manager from "../../pages/manager";

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
              <ProfileInformationSection />
            </div>
            <div className="right-column">
              <ReadingProgressSection />
            </div>
          </div>
        </div>
      </Manager>
    );
  }
}

export default ProfilePage;
