import React from "react";
import SearchBox from "../../features/header/searchBox";
import ChatbotDialog from "../dialogs/chatbotDialog";
import { HeaderProps } from "./interface";
import { UserPanelDialog } from "../../features/header/userPanel";

const Header: React.FC<HeaderProps> = (props) => {

  return (
    <div 
      className="w-full px-5 pt-5 pb-2.5 md:px-5 md:pt-5 md:pb-2.5 md:p-1 flex items-center bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out box-border"
    >
      <div className="flex flex-row items-center">
        <div className="relative min-w-[120px] md:min-w-[200px] max-w-[400px] flex md:ml-0 ml-9">
          <SearchBox />
        </div>
      </div>

      <div className="flex items-center gap-5 md:gap-2 ml-auto mr-5 md:mr-[5px]">
        <UserPanelDialog 
          handleSetting={props.handleSetting}
          isNewWarning={props.isNewWarning}
        />
      </div>
      <ChatbotDialog />
    </div>
  );
};

export default Header;
