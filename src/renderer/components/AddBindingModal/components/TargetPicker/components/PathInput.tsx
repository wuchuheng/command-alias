import React from 'react';
import { ActionType } from '../types';

export interface PathInputProps {
  actionType: ActionType;
  value: string;
  onChange: (v: string) => void;
  onFocusLaunch: () => void;
  className?: string;
  isLaunch: boolean;
}

/** Text input for target path / command with context-aware placeholder. */
export const PathInput: React.FC<PathInputProps> = ({
  actionType,
  value,
  onChange,
  onFocusLaunch,
  className = '',
  isLaunch,
}) => {
  // 3. Output handling
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => isLaunch && onFocusLaunch()}
      placeholder={
        isLaunch
          ? 'Executable path (or pick an app)'
          : actionType === 'run-command'
            ? 'Command to run'
            : 'Script file path'
      }
      className={`w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 ${className}`}
      required
    />
  );
};
