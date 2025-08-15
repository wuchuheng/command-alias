import type { InstalledApp } from './apps.service';

/**
 * Scans Linux applications from desktop files and common directories.
 * @returns Array of discovered Linux applications
 * @todo Implement Linux application discovery using .desktop files
 */
export async function scanLinuxApps(): Promise<InstalledApp[]> {
  // 1. Input handling
  // TODO: Implement Linux app scanning (desktop files, common paths)

  // 2. Core processing
  // TODO: Scan /usr/share/applications, ~/.local/share/applications
  // TODO: Parse .desktop files for application metadata
  throw new Error('Linux app scanning not implemented');

  // 3. Output handling
  return [];
}

/**
 * Creates dialog options for Linux/Unix executable selection.
 * @returns Electron dialog options configured for Linux/Unix
 */
export function createLinuxDialogOptions(): Electron.OpenDialogOptions {
  return {
    properties: ['openFile'],
    filters: [{ name: 'All Files', extensions: ['*'] }],
  };
}
