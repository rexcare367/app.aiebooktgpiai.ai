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
    const profilePageContent = (
      <div className="profile-page-container">
        <ProfileInformationSection />
        <ReadingProgressSection />
      </div>
    );
    return <Manager>{profilePageContent}</Manager>;
  }
}

export default ProfilePage;
