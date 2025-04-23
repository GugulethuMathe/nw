import React, { useState } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import logoPath from "@assets/logo.png";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const { isOffline, syncStatus } = useOfflineStatus();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Mock user data - would come from auth context in real app
  const user = {
    name: "John Doe",
    initials: "JD",
    role: "Field Assessor"
  };

  return (
    <header className="bg-primary-500 text-white shadow-md fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="mr-4 text-white focus:outline-none"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="flex items-center">
            <img src={logoPath} alt="North West CET College Logo" className="h-10 mr-3" />
            <h1 className="text-xl font-medium">Baseline Assessment System</h1>
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
            className="flex items-center cursor-pointer relative"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
              <span>{user.initials}</span>
            </div>
            <span className="ml-2 hidden sm:inline">{user.name}</span>
            <i className="fas fa-chevron-down ml-1 text-xs"></i>
            
            {isUserDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white text-neutral-800 shadow-lg rounded-md py-2 w-48">
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-neutral-500">{user.role}</p>
                </div>
                <a href="#profile" className="flex items-center px-4 py-2 hover:bg-neutral-50">
                  <i className="fas fa-user-circle w-5"></i>
                  <span>Profile</span>
                </a>
                <a href="#settings" className="flex items-center px-4 py-2 hover:bg-neutral-50">
                  <i className="fas fa-cog w-5"></i>
                  <span>Settings</span>
                </a>
                <div className="border-t border-neutral-200 mt-2"></div>
                <a href="#logout" className="flex items-center px-4 py-2 hover:bg-neutral-50 text-error-light">
                  <i className="fas fa-sign-out-alt w-5"></i>
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
