import React, { useState } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import logoPath from "@assets/logo.png";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { isOffline, syncStatus } = useOfflineStatus();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-primary-500 text-white shadow-md fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="mr-4 text-white focus:outline-none hover:bg-primary-600 p-2 rounded-md transition-colors"
            onClick={() => onToggleSidebar()}
            aria-label="Toggle sidebar"
            type="button"
          >
            <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>
          <div className="flex items-center">
            <img src={logoPath} alt="North West CET College Logo" className="h-10 mr-3 bg-white p-1 rounded" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div 
            className={`hidden sm:flex items-center text-sm px-3 py-1 rounded-full ${
              isOffline ? "bg-warning-light" : "bg-primary-700"
            }`}
          >
            <i className={`fas ${isOffline ? "fa-exclamation-circle" : "fa-sync-alt"} mr-2`}></i>
            <span>{syncStatus}</span>
          </div>
          
          <div 
            className="relative"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <button 
              className="flex items-center cursor-pointer focus:outline-none"
              aria-label="Open user menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
                <span>{user ? (user.name ? user.name.split(' ')[0][0].toUpperCase() : 'U') : 'G'}</span>
              </div>
              <span className="ml-2 hidden sm:inline">{user ? user.name : 'Guest'}</span>
              <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </button>
            
            {isUserDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white text-neutral-800 shadow-lg rounded-md py-2 w-48">
                {user ? (
                  <div className="px-4 py-2 border-b border-neutral-200">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-neutral-500">{user.role}</p>
                  </div>
                ) : (
                  <div className="px-4 py-2 border-b border-neutral-200">
                    <p className="font-medium">Guest</p>
                    <p className="text-sm text-neutral-500">Please log in</p>
                  </div>
                )}
                <a href="#profile" className="flex items-center px-4 py-2 hover:bg-neutral-50">
                  <i className="fas fa-user-circle w-5"></i>
                  <span>Profile</span>
                </a>
                <a href="#settings" className="flex items-center px-4 py-2 hover:bg-neutral-50">
                  <i className="fas fa-cog w-5"></i>
                  <span>Settings</span>
                </a>
                <div className="border-t border-neutral-200 mt-2"></div>
                {user && (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 hover:bg-neutral-50 text-error-light w-full text-left"
                  >
                    <i className="fas fa-sign-out-alt w-5"></i>
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
