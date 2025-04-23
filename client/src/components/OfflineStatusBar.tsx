import React from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const OfflineStatusBar: React.FC = () => {
  const { isOffline, pendingChanges } = useOfflineStatus();
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-warning-light text-white p-3 flex items-center justify-between z-20">
      <div className="flex items-center">
        <i className="fas fa-wifi-slash mr-2"></i>
        <span>You are working offline. {pendingChanges} changes pending synchronization.</span>
      </div>
      <button className="px-3 py-1 bg-white text-warning-dark rounded-md text-sm hover:bg-neutral-100 focus:outline-none">
        View Details
      </button>
    </div>
  );
};

export default OfflineStatusBar;
