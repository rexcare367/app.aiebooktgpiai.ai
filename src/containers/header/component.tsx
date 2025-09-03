import React from "react";
import "./header.css";
import SearchBox from "../../components/searchBox";
import ChatbotDialog from "../../components/dialogs/chatbotDialog";
import { HeaderProps } from "./interface";
import UserPanelDialog from "../../components/dialogs/userPanelDialog";

const Header: React.FC<HeaderProps> = (props) => {

  return (
    <div className="header">
      <div className="flex flex-row items-center">
        <div className="relative min-w-[120px] md:min-w-[200px] max-w-[400px] flex md:ml-0 ml-9">
          <SearchBox />
        </div>
      </div>

      <div className="right-controls">
        <UserPanelDialog />
      </div>
      <ChatbotDialog />
    </div>
  );
};

export default Header;
