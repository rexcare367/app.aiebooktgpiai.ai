import React, { useState, useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
import "./UserPanelDialog.css";
import { useAuthContext } from "../../../pages/auth/AuthProvider";
import { User2Icon, LogOut, Settings, X, Camera } from "lucide-react";

interface UserPanelDialogProps {
  handleSetting: (show: boolean) => void;
  isNewWarning?: boolean;
}

const UserPanelDialog: React.FC<UserPanelDialogProps> = ({ handleSetting, isNewWarning }) => {
  const [isShow, setIsShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthContext();
  const history = useHistory();

  const handleShow = () => {
    setIsShow((prevState) => !prevState);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleManageAccount = () => {
    history.push(`/manager/profile`);
    setIsShow(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsShow(false);
      }
    };

    if (isShow) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShow]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShow(false);
      }
    };

    if (isShow) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isShow]);

  return (
    <div className="user-panel-container">
      <div 
        className="user-panel-header" 
        onClick={handleShow}
        ref={buttonRef}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleShow();
          }
        }}
        aria-expanded={isShow}
        aria-haspopup="true"
      >
        <User2Icon className="md:w-6 w-4" />
        <span>{user?.name}</span>
      </div>

      {isShow && (
        <div
          className="user-panel-content"
          ref={dropdownRef}
          role="menu"
          aria-label="User menu"
        >
          {/* Header with email and close button */}
          <div className="user-panel-header-section">
            <div className="user-panel-email">{user?.email || "user@example.com"}</div>
            <button 
              className="user-panel-close"
              onClick={() => setIsShow(false)}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile picture section */}
          <div className="user-panel-profile-section">
            <div className="user-panel-avatar-container">
              <div className="user-panel-avatar">
                <User2Icon className="w-12 h-12" />
              </div>
              <button className="user-panel-camera-btn" aria-label="Change profile picture">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="user-panel-greeting">
              Hi, {user?.name || "User"}!
            </div>
            <div className="user-panel-email">{user?.ic_number || "user@example.com"}</div>
            </div>

          <div className="user-panel-actions">
            <button 
              className="user-panel-action-btn rounded-l-full"
              onClick={handleManageAccount}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleManageAccount();
                }
              }}
            >
              <Settings className="w-4 h-4" />
              <Trans>Manage Profile</Trans>
            </button>
            <button 
              className="user-panel-action-btn rounded-r-full"
              onClick={handleLogout}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLogout();
                }
              }}
            >
              <LogOut className="w-4 h-4" />
              <Trans>Sign out</Trans>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanelDialog;
