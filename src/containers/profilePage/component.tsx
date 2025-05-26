import React from "react";
import "./profilePage.css";
import { Trans } from "react-i18next";
import { ProfilePageProps, ProfilePageState } from "./interface";
import ReadingProgressSection from "./readingProgress/readingProgress";
// import LeaderboardSection from "./leaderBoard/leaderboard";
import ProfileInformationSection from "./profileInformation/profileInformation";
import Manager from "../../pages/manager";

class ProfilePage extends React.Component<ProfilePageProps, ProfilePageState> {
  constructor(props: ProfilePageProps) {
    super(props);
    this.state = {
      loading: false,
      updating: false,
      username: "",
      userId: "",
      email: "",
      phone_number: "",
      address: "",
      name: "",
      guardianName: "",
    };
  }

  render() {
    const profilePageContent = (
      <div className="profile-page-container">
        {this.state.loading ? (
          <h1>
            <Trans>Loading</Trans>...
          </h1>
        ) : (
          <>
            <ProfileInformationSection />
            {/* <LeaderboardSection /> */}
            <ReadingProgressSection />
          </>
        )}
      </div>
    );
    return <Manager>{profilePageContent}</Manager>;
  }
}

export default ProfilePage;
