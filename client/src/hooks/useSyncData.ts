import { useState, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

interface PendingChange {
  id: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
}

// In a real app, this would be stored in IndexedDB or localStorage
let pendingChangesStore: PendingChange[] = [];

export function useSyncData() {
  const [pendingChanges, setPendingChanges] = useState<number>(pendingChangesStore.length);
  const [syncStatus, setSyncStatus] = useState<string>("All changes synced");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Add data to the sync queue
  const addToSyncQueue = useCallback((endpoint: string, method: string, data: any) => {
    const newChange: PendingChange = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    };
    
    pendingChangesStore.push(newChange);
    setPendingChanges(pendingChangesStore.length);
    setSyncStatus(`${pendingChangesStore.length} changes pending`);
    
    // Trigger sync if online
    if (navigator.onLine) {
      syncData();
    }
    
    return newChange.id;
  }, []);

  // Sync data with the server
  const syncData = useCallback(async () => {
    if (pendingChangesStore.length === 0 || isSyncing || !navigator.onLine) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus("Syncing changes...");

    const changesToSync = [...pendingChangesStore];
    
    try {
      for (const change of changesToSync) {
        try {
          // Attempt to sync the change with the server
          await fetch(change.endpoint, {
            method: change.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(change.data),
          });
          
          // If successful, remove from pending changes
          pendingChangesStore = pendingChangesStore.filter(pc => pc.id !== change.id);
          setPendingChanges(pendingChangesStore.length);
          
          // Invalidate related queries to refresh data
          queryClient.invalidateQueries();
        } catch (error) {
          console.error("Failed to sync change:", change, error);
        }
      }
      
      if (pendingChangesStore.length === 0) {
        setSyncStatus("All changes synced");
      } else {
        setSyncStatus(`${pendingChangesStore.length} changes pending`);
      }
    } catch (error) {
      console.error("Sync process failed:", error);
      setSyncStatus(`Sync failed: ${pendingChangesStore.length} changes pending`);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Automatically try to sync whenever we come online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingChangesStore.length > 0) {
        syncData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData]);

  return {
    addToSyncQueue,
    pendingChanges,
    syncStatus,
    isSyncing,
    syncData,
  };
}
