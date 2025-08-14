import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { InstalledApp } from '../types';

export interface AppSearchPanelProps {
  open: boolean;
  isLaunch: boolean;
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  error: string | null;
  apps: InstalledApp[];
  onPick: (app: InstalledApp) => void;
  onRefresh: () => void;
  selectedApp?: InstalledApp;
  close: () => void;
}

/** Floating panel containing searchable list of installed apps. */
export const AppSearchPanel: React.FC<AppSearchPanelProps> = ({
  open,
  isLaunch,
  search,
  setSearch,
  loading,
  error,
  apps,
  onPick,
  onRefresh,
  selectedApp,
  close,
}) => {
  if (!open || !isLaunch) return null;

  // 1. Input handling (refs & state needed for dynamic sizing)
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listWrapperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [listMaxHeight, setListMaxHeight] = useState<number | undefined>(undefined);
  // Tailwind max-h-56 equals 14rem (= 224px). We replicate that upper bound while still shrinking when space is limited.
  const LIST_HARD_CAP_PX = 14 * 16; // 224

  // 2. Core processing (compute available space each open / resize)
  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const padding = 8; // viewport bottom padding
      const available = window.innerHeight - rect.top - padding; // space from panel top to bottom
      // Cap list height to Tailwind max-h-56 (224px) when space allows.
      const panelCap = available; // available vertical space below trigger
      const headerH = headerRef.current?.getBoundingClientRect().height || 0;
      const footerH = footerRef.current?.getBoundingClientRect().height || 0;
      // subtract internal vertical padding (p-2 => 0.5rem *2 = 16px)
      const internalPad = 16;
      const rawList = panelCap - headerH - footerH - internalPad;
      const constrained = Math.min(rawList, LIST_HARD_CAP_PX); // enforce legacy cap
      const maxList = Math.max(80, constrained); // enforce sensible minimum
      setListMaxHeight(maxList);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [open]);

  // Recompute when apps list size changes significantly (e.g., after refresh)
  useEffect(() => {
    if (!open) return;
    // 2.1 small defer to allow DOM list rendering
    const id = window.requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const padding = 8;
      const available = window.innerHeight - rect.top - padding;
      const panelCap = available;
      const headerH = headerRef.current?.getBoundingClientRect().height || 0;
      const footerH = footerRef.current?.getBoundingClientRect().height || 0;
      const internalPad = 16;
      const rawList = panelCap - headerH - footerH - internalPad;
      const maxList = Math.max(80, Math.min(rawList, LIST_HARD_CAP_PX));
      setListMaxHeight(maxList);
    });
    return () => window.cancelAnimationFrame(id);
  }, [apps.length, open]);

  // 3. Output handling (render)
  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full z-20 mt-1 flex w-full min-w-[18rem] flex-col rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800"
    >
      <div ref={headerRef} className="mb-2 flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search apps"
          className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-500 dark:bg-gray-700"
        />
        <button
          type="button"
          onClick={() => onRefresh()}
          title="Refresh"
          className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <FiRefreshCw className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <div className="mb-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      <div
        ref={listWrapperRef}
        style={listMaxHeight ? { maxHeight: listMaxHeight } : undefined}
        className="flex-1 overflow-auto rounded border border-gray-200 dark:border-gray-600"
      >
        {loading && apps.length === 0 ? (
          <div className="p-2 text-xs opacity-70">Loading…</div>
        ) : apps.length === 0 ? (
          <div className="p-2 text-xs opacity-70">No apps found</div>
        ) : (
          <ul>
            {apps.map(app => (
              <li
                key={app.id}
                className="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  onPick(app);
                  close();
                }}
                title={app.path}
              >
                {app.iconDataUrl ? (
                  <img src={app.iconDataUrl} alt="" className="h-4 w-4" />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-gray-300 text-[10px] text-gray-700 dark:bg-gray-600 dark:text-gray-100">
                    {app.name.slice(0, 1)}
                  </div>
                )}
                <span className="truncate">{app.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedApp && (
        <div ref={footerRef} className="mt-2 truncate text-[10px] opacity-70" title={selectedApp.path}>
          Selected: {selectedApp.name}
        </div>
      )}
    </div>
  );
};
