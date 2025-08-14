import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionType, InstalledApp } from './types';

/** Hook encapsulating installed apps loading / filtering logic. */
export const useInstalledApps = (actionType: ActionType, isModalOpen: boolean) => {
  // 1. Input handling
  const isLaunch = actionType === 'launch-app';
  const firstLoadRef = useRef(false);

  // 2. Core processing (state + loaders)
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadApps = useCallback(
    async (force = false) => {
      if (!isLaunch) return;
      setLoading(true);
      setError(null);
      try {
        const data = force
          ? await window.electron.apps.refreshInstalledApps()
          : await window.electron.apps.getInstalledApps();
        setApps(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load apps');
      } finally {
        setLoading(false);
      }
    },
    [isLaunch]
  );

  // Lazy initial load
  useEffect(() => {
    if (isModalOpen && isLaunch && !firstLoadRef.current) {
      firstLoadRef.current = true;
      void loadApps(false);
    }
  }, [isModalOpen, isLaunch, loadApps]);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a => a.name.toLowerCase().includes(q));
  })();

  // 3. Output handling
  return {
    isLaunch,
    apps,
    filtered,
    loading,
    error,
    search,
    setSearch,
    loadApps,
  };
};
