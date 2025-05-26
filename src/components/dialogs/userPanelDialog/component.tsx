import React, { useState } from "react";
import { Trans } from "react-i18next";
import { withRouter, useHistory } from "react-router-dom";
import "./userPanelDialog.css";
import { useAuth } from "../../../hooks/useAuth";
import { User2Icon, IdCard, LogOutIcon } from "lucide-react";

const UserPanelDialog = () => {
  const [isShow, setIsShow] = useState(false);

  const { signOut, user } = useAuth();
  const history = useHistory();

  const handleShow = () => {
    setIsShow((prevState) => !prevState);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const handleJumpToProfile = () => {
    history.push(`/manager/profile`);
  };

  return (
    <div className="user-panel-container">
      <div className="user-panel-header" onClick={() => handleShow()}>
        <User2Icon />
        <span>{user?.username}</span>
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
            <li className="user-panel-item" onClick={() => handleSignOut()}>
              <LogOutIcon />
              <Trans>Sign out</Trans>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default withRouter(UserPanelDialog as any);
