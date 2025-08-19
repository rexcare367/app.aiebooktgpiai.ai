import React, { useState } from "react";
import { Trans } from "react-i18next";
import { withRouter, useHistory } from "react-router-dom";
import "./userPanelDialog.css";
import { useAuthContext } from "../../auth/AuthProvider";
import { User2Icon, IdCard, Settings } from "lucide-react";

const UserPanelDialog = ({ handleSetting, isNewWarning }) => {
  const [isShow, setIsShow] = useState(false);

  const { user, logout } = useAuthContext();
  const history = useHistory();

  const handleShow = () => {
    setIsShow((prevState) => !prevState);
  };

  const handleJumpToProfile = () => {
    history.push(`/manager/profile`);
  };

  const handleLogout = () => {
    logout();
    setIsShow(false);
  };

  return (
    <div className="user-panel-container">
      <div className="user-panel-header" onClick={() => handleShow()}>
        <User2Icon className="md:w-6 w-4" />
        <span>{user?.name || user?.email || "User"}</span>
      </div>

      {isShow && (
        <div
          className="user-panel-content absolute top-11 w-full left-0 rounded-lg p-2"
          onMouseLeave={() => handleShow()}
        >
          <ul className="">
            <li
              className="user-panel-item"
              onClick={() => {
                handleJumpToProfile();
              }}
              style={{ cursor: "pointer" }}
            >
              <IdCard />
              <Trans>Profile</Trans>
            </li>
            <li
              className="user-panel-item"
              onClick={() => {
                handleSetting(true);
                handleShow();
              }}
              style={{ cursor: "pointer" }}
            >
              <Settings style={isNewWarning ? { color: "rgb(35, 170, 242)" } : {}} />
              <Trans>Settings</Trans>
            </li>
            <li className="user-panel-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
              <User2Icon className="w-4 h-4" />
              <Trans>Logout</Trans>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserPanelDialog;
