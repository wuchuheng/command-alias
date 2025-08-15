import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { InstalledApp } from './apps.service';

// macOS application directories
const MACOS_APP_LOCATIONS = [
  '/Applications',
  '/System/Applications',
  path.join(process.env.HOME || '', 'Applications'),
  '/Applications/Utilities',
  '/System/Library/CoreServices',
];

/**
 * Extracts application icon as a base64 data URL.
 * @param exePath Path to the executable or application bundle
 * @returns Base64 data URL of the icon or undefined if extraction fails
 */
async function getIconDataUrl(exePath: string): Promise<string | undefined> {
  try {
    // Ensure app is ready before calling getFileIcon
    if (!app.isReady()) {
      await app.whenReady();
    }
    const icon = await app.getFileIcon(exePath, { size: 'normal' });
    if (icon && !icon.isEmpty()) {
      // Downscale to 32x32 if very large to reduce IPC payload
      const resized = icon.resize({ width: 32, height: 32 });
      return resized.toDataURL();
    }
  } catch (e) {
    // ignore icon failures
  }
  return undefined;
}

/**
 * Scans macOS applications from standard directories.
 * @returns Array of discovered macOS applications
 */
export async function scanMacOSApps(): Promise<InstalledApp[]> {
  // 1. Input handling
  const apps: InstalledApp[] = [];

  // 2. Core processing
  for (const dir of MACOS_APP_LOCATIONS) {
    try {
      if (!fs.existsSync(dir)) continue;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.endsWith('.app')) continue;

        const appPath = path.join(dir, entry.name);
        const appName = entry.name.replace('.app', '');

        // 2.1 Try to find the executable inside the app bundle
        const executablePath = path.join(appPath, 'Contents', 'MacOS', appName);
        let finalPath = appPath;

        try {
          if (fs.existsSync(executablePath)) {
            finalPath = executablePath;
          }
        } catch {
          // Keep app bundle path if executable not found
        }

        // 2.2 Extract icon and create app entry
        try {
          const iconDataUrl = await getIconDataUrl(appPath);
          apps.push({
            id: finalPath,
            name: appName,
            path: finalPath,
            iconDataUrl,
            source: dir.includes('/System/') ? 'system' : 'applications',
          });
        } catch (e) {
          apps.push({
            id: finalPath,
            name: appName,
            path: finalPath,
            source: dir.includes('/System/') ? 'system' : 'applications',
          });
        }
      }
    } catch (e) {
      // ignore missing or inaccessible directories
    }
  }

  // 3. Output handling
  return apps;
}

/**
 * Creates dialog options for macOS executable selection.
 * @returns Electron dialog options configured for macOS
 */
export function createMacOSDialogOptions(): Electron.OpenDialogOptions {
  return {
    properties: ['openFile'],
    message: 'Select an application or executable file',
    defaultPath: '/Applications',
  };
}

/**
 * Resolves macOS .app bundle to its internal executable path.
 * @param appPath Path to the .app bundle
 * @returns Resolved executable path or original app path if resolution fails
 */
export function resolveMacOSAppBundle(appPath: string): string {
  // 1. Input handling
  if (!appPath.endsWith('.app')) return appPath;

  // 2. Core processing
  const appName = appPath.split('/').pop()?.replace('.app', '') || '';
  const executablePath = `${appPath}/Contents/MacOS/${appName}`;

  // 3. Output handling
  try {
    if (fs.existsSync(executablePath)) {
      return executablePath;
    }
  } catch {
    // Keep original .app path if verification fails
  }
  return appPath;
}
