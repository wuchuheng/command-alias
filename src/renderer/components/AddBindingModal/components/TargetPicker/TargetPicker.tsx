import React, { useEffect, useRef, useState } from 'react';
import { ActionType, InstalledApp } from './types';
import { useInstalledApps } from './useInstalledApps';
import { PathInput } from './components/PathInput';
import { ActionButtons } from './components/ActionButtons';
import { AppSearchPanel } from './components/AppSearchPanel';

export interface TargetPickerProps {
  actionType: ActionType;
  value: string;
  onChange: (val: string, appName?: string) => void;
  isModalOpen: boolean;
  className?: string;
}

/**
 * Unified target control allowing a path/command/script to be typed or an app picked (launch mode).
 * Splits concerns across small subcomponents & a hook for clarity.
 */
export const TargetPicker: React.FC<TargetPickerProps> = ({
  actionType,
  value,
  onChange,
  isModalOpen,
  className = '',
}) => {
  // 1. Input handling
  const { isLaunch, apps, filtered, loading, error, search, setSearch, loadApps } = useInstalledApps(
    actionType,
    isModalOpen
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 2. Core processing (event handlers)
  const selectedApp: InstalledApp | undefined = value ? apps.find(a => a.path === value) : undefined;
  const openPanel = () => isLaunch && setPanelOpen(true);
  const togglePanel = () => isLaunch && setPanelOpen(o => !o);
  const closePanel = () => setPanelOpen(false);

  const handleBrowse = async () => {
    // 2.1 Native file dialog
    if (panelOpen) closePanel();
    const p = await window.electron.apps.browseForExecutable();
    if (p) onChange(p);
  };

  // Outside click / escape close
  useEffect(() => {
    if (!panelOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) closePanel();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [panelOpen]);

  // Close panel if mode changes away from launch
  useEffect(() => {
    if (!isLaunch) closePanel();
  }, [isLaunch]);

  // 3. Output handling
  return (
    <div ref={containerRef} className={`relative flex w-full items-start gap-2 ${className}`}>
      <div className="flex w-full justify-center gap-1">
        <PathInput
          actionType={actionType}
          value={value}
          onChange={onChange}
          onFocusLaunch={openPanel}
          isLaunch={isLaunch}
        />
        <ActionButtons
          isLaunch={isLaunch}
          panelOpen={panelOpen}
          selectedAppName={selectedApp?.name}
          togglePanel={togglePanel}
          onBrowse={handleBrowse}
        />
      </div>
      <AppSearchPanel
        open={panelOpen}
        isLaunch={isLaunch}
        search={search}
        setSearch={setSearch}
        loading={loading}
        error={error}
        apps={filtered}
        onPick={app => {
          onChange(app.path, app.name);
          closePanel();
        }}
        onRefresh={() => loadApps(true)}
        selectedApp={selectedApp}
        close={closePanel}
      />
    </div>
  );
};
