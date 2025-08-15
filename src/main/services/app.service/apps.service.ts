import { dialog } from 'electron';
import { logger } from '../../utils/logger';
import { scanMacOSApps, createMacOSDialogOptions, resolveMacOSAppBundle } from './macApps';
import { scanWindowsApps, createWindowsDialogOptions } from './windowsApps';
import { scanLinuxApps, createLinuxDialogOptions } from './linuxApps';

/**
 * Represents an installed application with metadata.
 */
export type InstalledApp = {
  /** Unique identifier for the application. */
  id: string;
  /** Display name of the application. */
  name: string;
  /** Resolved executable path. */
  path: string;
  /** Base64-encoded icon data URL. */
  iconDataUrl?: string;
  /** Source location where the app was discovered. */
  source: 'programdata' | 'appdata' | 'applications' | 'system';
};

let cachedApps: InstalledApp[] | null = null;
let lastScanAt = 0;

/**
 * Removes duplicate applications based on their path.
 * @param apps Array of applications to deduplicate
 * @returns Array with unique applications by path
 */
function dedupeByPath(apps: InstalledApp[]): InstalledApp[] {
  const seen = new Map<string, InstalledApp>();
  for (const a of apps) {
    const key = a.path.toLowerCase();
    if (!seen.has(key)) seen.set(key, a);
  }
  return Array.from(seen.values());
}

/**
 * Scans for installed applications on the current platform.
 * @param force Whether to force a fresh scan, ignoring cache
 * @returns Array of discovered applications
 */
export async function scanInstalledApps(force = false): Promise<InstalledApp[]> {
  // 1. Input handling
  const now = Date.now();
  if (!force && cachedApps && now - lastScanAt < 5 * 60 * 1000) {
    return cachedApps;
  }

  // 2. Core processing - platform-specific scanning
  let resolved: InstalledApp[] = [];

  if (process.platform === 'darwin') {
    resolved = await scanMacOSApps();
  } else if (process.platform === 'win32') {
    resolved = await scanWindowsApps();
  } else {
    resolved = await scanLinuxApps();
  }

  // 3. Output handling
  const unique = dedupeByPath(resolved).sort((a, b) => a.name.localeCompare(b.name));
  cachedApps = unique;
  lastScanAt = now;
  logger.info(`Scanned installed apps: ${unique.length} items (platform: ${process.platform})`);
  return unique;
}

/**
 * Clears the cached applications list, forcing a fresh scan on next request.
 */
export function clearAppsCache() {
  cachedApps = null;
  lastScanAt = 0;
}

/**
 * Opens a platform-specific file dialog to browse for executable files.
 * @returns Selected executable path or null if canceled
 */
export async function browseForExecutable(): Promise<string | null> {
  try {
    // 1. Input handling
    const isMac = process.platform === 'darwin';
    const isWindows = process.platform === 'win32';

    // 2. Core processing - get platform-specific dialog options
    let dialogOptions: Electron.OpenDialogOptions;

    if (isMac) {
      dialogOptions = createMacOSDialogOptions();
    } else if (isWindows) {
      dialogOptions = createWindowsDialogOptions();
    } else {
      dialogOptions = createLinuxDialogOptions();
    }

    // 2.1 Show dialog and get result
    const res = await dialog.showOpenDialog(dialogOptions);
    if (res.canceled || res.filePaths.length === 0) return null;

    // 3. Output handling - resolve platform-specific paths
    let selectedPath = res.filePaths[0];

    if (isMac) {
      selectedPath = resolveMacOSAppBundle(selectedPath);
    }

    return selectedPath;
  } catch (e) {
    logger.error('browseForExecutable failed', e);
    throw e;
  }
}
