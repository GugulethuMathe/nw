import { useState, useEffect } from "react";
import { useSyncData } from "./useSyncData";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { pendingChanges, syncStatus, syncData } = useSyncData();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Attempt to sync data when coming back online
      syncData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  return {
    isOffline,
    pendingChanges,
    syncStatus: isOffline ? "Working Offline" : syncStatus
  };
}
