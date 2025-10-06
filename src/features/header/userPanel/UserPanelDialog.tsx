import React, { useState, useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
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
    <div className="relative float-left w-fit">
      {/* User Profile Button - Google Style */}
      <div 
        className="bg-theme-light text-theme h-10 text-text dark:text-white cursor-pointer flex items-center rounded-full px-4 md:px-3 gap-2 md:gap-1.5 text-base md:text-sm font-medium transition-all duration-200 select-none hover:shadow-md focus:outline-none focus:ring-2 focus:ring-theme/30 focus:ring-offset-1" 
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
        <User2Icon className="w-5 h-5 md:w-4 md:h-4" />
        <span className="max-w-[120px] truncate">{user?.name}</span>
      </div>

      {/* Dropdown Menu - Professional Clean Design */}
      {isShow && (
        <div
          className="absolute top-full right-0 md:left-[-170px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.4)] z-modal min-w-[320px] max-w-[360px] mt-2 overflow-hidden animate-fade-in"
          ref={dropdownRef}
          role="menu"
          aria-label="User menu"
        >
          {/* Profile Section - Clean Professional Style */}
          <div className="flex flex-col items-center p-6 text-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {/* Profile Avatar */}
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                <User2Icon className="w-10 h-10" />
              </div>
              <button 
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500" 
                aria-label="Change profile picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* User Information */}
            <h3 className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">
              {user?.name || "User"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{user?.email || "user@example.com"}</p>
            {user?.ic_number && (
              <p className="text-gray-500 dark:text-gray-500 text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full mt-1">
                {user.ic_number}
              </p>
            )}
          </div>

          {/* Action Buttons - Original Side-by-Side Style */}
          <div className="flex p-3 gap-2 bg-white dark:bg-gray-800">
            <button 
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-none rounded-full py-2.5 px-3 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleManageAccount}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleManageAccount();
                }
              }}
              role="menuitem"
            >
              <Settings className="w-4 h-4" />
              <Trans>Manage</Trans>
            </button>
            
            <button 
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-none rounded-full py-2.5 px-3 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleLogout}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLogout();
                }
              }}
              role="menuitem"
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
