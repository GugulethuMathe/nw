import React, { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import OfflineStatusBar from "@/components/OfflineStatusBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Start with sidebar closed by default on all devices
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleToggleSidebar = () => {
    console.log("Toggle sidebar clicked");
    setIsSidebarOpen(prevState => !prevState);
  };
  
  // Removed the auto-opening behavior on resize to respect user's preference
  // We'll let the user control the sidebar state manually through the toggle button
  
  return (
    <div className="min-h-screen">
      <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleToggleSidebar} />
      
      <main 
        className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "ml-64" : ""}`}
      >
        {children}
      </main>
      
      <OfflineStatusBar />
    </div>
  );
};

export default AppLayout;
