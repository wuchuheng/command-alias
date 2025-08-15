import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { InstalledApp } from './apps.service';

// Windows Start Menu locations
const START_MENU_LOCATIONS = [
  () => path.join(process.env.ProgramData || 'C:/ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
  () => path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
];

/**
 * Recursively reads directory contents safely, ignoring errors.
 * @param dir Directory path to scan
 * @param results Accumulator array for file paths
 * @returns Array of file paths found
 */
function safeReaddirRecursive(dir: string, results: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        safeReaddirRecursive(full, results);
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    // ignore missing or inaccessible dirs
  }
  return results;
}

/**
 * Resolves Windows shortcut (.lnk) file to its target executable.
 * @param lnkPath Path to the .lnk file
 * @returns Target executable path or null if resolution fails
 */
async function resolveLnkTarget(lnkPath: string): Promise<string | null> {
  try {
    // windows-shortcuts does not have types; require dynamically
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require('windows-shortcuts');
    const target: string | null = await new Promise(resolve => {
      try {
        ws.query(lnkPath, (err: Error | null, data: { target?: string }) => {
          if (err) return resolve(null);
          resolve(data && data.target ? data.target : null);
        });
      } catch (e) {
        resolve(null);
      }
    });
    return target && typeof target === 'string' ? target : null;
  } catch (e) {
    return null;
  }
}

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
 * Scans Windows applications from Start Menu shortcuts.
 * @returns Array of discovered Windows applications
 */
export async function scanWindowsApps(): Promise<InstalledApp[]> {
  // 1. Input handling
  const candidates: { name: string; source: InstalledApp['source']; lnkPath: string }[] = [];

  // 2. Core processing
  // 2.1 Collect shortcut candidates
  for (const locFn of START_MENU_LOCATIONS) {
    const base = locFn();
    const files = safeReaddirRecursive(base);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.lnk') {
        const name = path.basename(file, ext);
        candidates.push({
          name,
          source: base.includes('ProgramData') ? 'programdata' : 'appdata',
          lnkPath: file,
        });
      }
    }
  }

  // 2.2 Resolve shortcuts to executables
  const resolved: InstalledApp[] = [];
  for (const c of candidates) {
    const target = await resolveLnkTarget(c.lnkPath);
    if (!target) continue;
    const ext = path.extname(target).toLowerCase();
    if (ext !== '.exe' && ext !== '.bat' && ext !== '.cmd') continue;
    const name = c.name || path.basename(target, ext);
    try {
      const iconDataUrl = await getIconDataUrl(target);
      resolved.push({ id: target, name, path: target, iconDataUrl, source: c.source });
    } catch (e) {
      resolved.push({ id: target, name, path: target, source: c.source });
    }
  }

  // 3. Output handling
  return resolved;
}

/**
 * Creates dialog options for Windows executable selection.
 * @returns Electron dialog options configured for Windows
 */
export function createWindowsDialogOptions(): Electron.OpenDialogOptions {
  return {
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe', 'bat', 'cmd'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  };
}
