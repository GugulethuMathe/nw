import React, { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import OfflineStatusBar from "@/components/OfflineStatusBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  const handleToggleSidebar = () => {
    console.log("Toggle sidebar clicked");
    setIsSidebarOpen(prevState => !prevState);
  };
  
  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      <AppHeader onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      
      <main 
        className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : ""}`}
      >
        {children}
      </main>
      
      <OfflineStatusBar />
    </div>
  );
};

export default AppLayout;
