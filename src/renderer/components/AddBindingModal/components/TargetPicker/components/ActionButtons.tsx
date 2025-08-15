import React, { useEffect, useState } from 'react';
import { FiFolder } from 'react-icons/fi';
import { GrAppsRounded } from 'react-icons/gr';

export interface ActionButtonsProps {
  isLaunch: boolean;
  panelOpen: boolean;
  selectedAppName?: string;
  togglePanel: () => void;
  onBrowse: () => Promise<void> | void;
}

/** Buttons for opening app picker panel and browsing for executable. */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLaunch,
  panelOpen,
  selectedAppName,
  togglePanel,
  onBrowse,
}) => {
  if (!isLaunch) return null;

  // 3. Output handling
  return (
    <>
      <button
        type="button"
        onClick={() => togglePanel()}
        className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        title={selectedAppName || 'Select installed application'}
        aria-pressed={panelOpen}
      >
        <GrAppsRounded className="h-3 w-3" />
      </button>

      <button
        type="button"
        onClick={() => onBrowse()}
        className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        title="Browse for executable"
      >
        <FiFolder className="h-3 w-3" />
      </button>
    </>
  );
};
