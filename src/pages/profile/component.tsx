import React from "react";
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
        <div 
          className="bg-white dark:bg-gray-800 relative h-full p-3 sm:p-4 md:p-6 lg:p-8 h-inherit rounded-2xl transition-all duration-300 overflow-auto"
        >
          {/* Banner Section with Gradient Overlay */}
          <div 
            className="relative w-full rounded-2xl overflow-hidden mb-6 lg:mb-8 shadow-lg transition-all duration-300 group"
            style={{ 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
            }}
          >
            <img 
              src="/assets/banner.jpg" 
              alt="Profile banner" 
              className="w-full h-[140px] sm:h-[180px] lg:h-[260px] object-cover block transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(360px,420px)_1fr] gap-6 lg:gap-8">
            {/* Profile Info Card */}
            <div className="min-w-0 transition-all duration-300">
              <ProfileInfoSection />
            </div>
            
            {/* Reading Stats Card */}
            <div className="min-w-0 transition-all duration-300">
              <ReadingStatsSection />
            </div>
          </div>
        </div>
      </Manager>
    );
  }
}

export default ProfilePage;
