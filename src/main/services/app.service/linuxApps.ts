import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { InstalledApp } from './apps.service';

// Standard Linux application directories
const LINUX_APP_LOCATIONS = [
  '/usr/share/applications',
  '/usr/local/share/applications',
  path.join(process.env.HOME || '', '.local/share/applications'),
  '/var/lib/snapd/desktop/applications',
  '/var/lib/flatpak/app',
  '/usr/share/pixmaps',
];

/**
 * Parses a .desktop file and extracts application metadata.
 * @param filePath Path to the .desktop file
 * @returns Parsed desktop entry or null if invalid
 */
function parseDesktopFile(filePath: string): {
  name: string;
  exec: string;
  icon?: string;
  noDisplay?: boolean;
} | null {
  try {
    // 1. Input handling
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // 2. Core processing
    let name = '';
    let exec = '';
    let icon = '';
    let noDisplay = false;
    let inDesktopEntry = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Check if we're in the [Desktop Entry] section
      if (trimmed === '[Desktop Entry]') {
        inDesktopEntry = true;
        continue;
      }

      // Stop processing if we hit another section
      if (trimmed.startsWith('[') && trimmed !== '[Desktop Entry]') {
        break;
      }

      if (!inDesktopEntry) continue;

      // Parse key-value pairs
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');

      switch (key) {
        case 'Name':
          name = value;
          break;
        case 'Exec':
          exec = value;
          break;
        case 'Icon':
          icon = value;
          break;
        case 'NoDisplay':
          noDisplay = value.toLowerCase() === 'true';
          break;
        case 'Type':
          // Only process Application type entries
          if (value !== 'Application') return null;
          break;
      }
    }

    // 3. Output handling
    if (!name || !exec || noDisplay) return null;

    return { name, exec, icon, noDisplay };
  } catch (e) {
    return null;
  }
}

/**
 * Extracts the actual executable path from an Exec field.
 * @param execField The Exec field from a .desktop file
 * @returns Cleaned executable path
 */
function extractExecutablePath(execField: string): string {
  // 1. Input handling
  // Remove field codes like %f, %F, %u, %U, etc.
  let cleaned = execField.replace(/%[fFuUdDnNickvm]/g, '').trim();

  // 2. Core processing
  // Handle quoted executables
  if (cleaned.startsWith('"')) {
    const endQuote = cleaned.indexOf('"', 1);
    if (endQuote > 0) {
      cleaned = cleaned.substring(1, endQuote);
    }
  } else {
    // Take only the first part (executable name/path)
    cleaned = cleaned.split(' ')[0];
  }

  // 3. Output handling
  return cleaned;
}

/**
 * Extracts application icon as a base64 data URL.
 * @param iconPath Path to the icon file or icon name
 * @returns Base64 data URL of the icon or undefined if extraction fails
 */
async function getIconDataUrl(iconPath: string): Promise<string | undefined> {
  try {
    // 1. Input handling
    if (!iconPath) return undefined;

    // Ensure app is ready before calling getFileIcon
    if (!app.isReady()) {
      await app.whenReady();
    }

    // 2. Core processing
    let fullIconPath = iconPath;

    // If it's not an absolute path, try to find it in standard icon directories
    if (!path.isAbsolute(iconPath)) {
      const iconDirs = [
        '/usr/share/icons',
        '/usr/share/pixmaps',
        path.join(process.env.HOME || '', '.local/share/icons'),
        path.join(process.env.HOME || '', '.icons'),
      ];

      for (const dir of iconDirs) {
        // Try common icon extensions
        for (const ext of ['png', 'svg', 'xpm', 'ico']) {
          const testPath = path.join(dir, `${iconPath}.${ext}`);
          if (fs.existsSync(testPath)) {
            fullIconPath = testPath;
            break;
          }
        }
        if (path.isAbsolute(fullIconPath)) break;
      }
    }

    // Check if icon file exists
    if (!fs.existsSync(fullIconPath)) return undefined;

    const icon = await app.getFileIcon(fullIconPath, { size: 'normal' });
    if (icon && !icon.isEmpty()) {
      // 3. Output handling
      const resized = icon.resize({ width: 32, height: 32 });
      return resized.toDataURL();
    }
  } catch (e) {
    // ignore icon failures
  }
  return undefined;
}

/**
 * Scans Linux applications from desktop files and common directories.
 * @returns Array of discovered Linux applications
 */
export async function scanLinuxApps(): Promise<InstalledApp[]> {
  // 1. Input handling
  const apps: InstalledApp[] = [];

  // 2. Core processing
  for (const dir of LINUX_APP_LOCATIONS) {
    try {
      if (!fs.existsSync(dir)) continue;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // 2.1 Process .desktop files
        if (entry.isFile() && entry.name.endsWith('.desktop')) {
          const desktopFilePath = path.join(dir, entry.name);
          const desktopEntry = parseDesktopFile(desktopFilePath);

          if (!desktopEntry) continue;

          // 2.2 Extract executable path and create app entry
          const executablePath = extractExecutablePath(desktopEntry.exec);
          const appId = path.basename(entry.name, '.desktop');

          try {
            const iconDataUrl = await getIconDataUrl(desktopEntry.icon || '');
            apps.push({
              id: appId,
              name: desktopEntry.name,
              path: executablePath,
              iconDataUrl,
              source: dir.includes(process.env.HOME || '') ? 'applications' : 'system',
            });
          } catch (e) {
            // Add without icon if icon extraction fails
            apps.push({
              id: appId,
              name: desktopEntry.name,
              path: executablePath,
              source: dir.includes(process.env.HOME || '') ? 'applications' : 'system',
            });
          }
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
 * Creates dialog options for Linux/Unix executable selection.
 * @returns Electron dialog options configured for Linux/Unix
 */
export function createLinuxDialogOptions(): Electron.OpenDialogOptions {
  return {
    properties: ['openFile'],
    filters: [{ name: 'All Files', extensions: ['*'] }],
  };
}
