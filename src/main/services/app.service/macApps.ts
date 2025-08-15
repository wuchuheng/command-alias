import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { app, nativeImage } from 'electron';
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
 * Converts a native image to a 32x32 data URL.
 * @param icon Native image to convert
 * @returns Data URL string or undefined if conversion fails
 */
function convertIconToDataUrl(icon: Electron.NativeImage | null): string | undefined {
  if (!icon || icon.isEmpty()) return undefined;

  const resized = icon.resize({ width: 32, height: 32 });
  return resized.toDataURL();
}

/**
 * Cleans up temporary file safely.
 * @param filePath Path to temporary file
 */
function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Extracts icon using macOS sips command.
 * @param appPath Path to the .app bundle
 * @returns Data URL string or undefined if extraction fails
 */
async function extractIconWithSips(appPath: string): Promise<string | undefined> {
  // 1. Input handling
  const tempIconPath = path.join(os.tmpdir(), `app_icon_${Date.now()}.png`);
  const sipsCommand = `sips -s format png "${appPath}/Contents/Resources/$(defaults read "${appPath}/Contents/Info" CFBundleIconFile 2>/dev/null || echo "AppIcon").icns" --out "${tempIconPath}" 2>/dev/null`;

  // 2. Core processing
  try {
    execSync(sipsCommand, { timeout: 5000 });

    if (fs.existsSync(tempIconPath)) {
      const iconBuffer = fs.readFileSync(tempIconPath);
      const icon = nativeImage.createFromBuffer(iconBuffer);
      const result = convertIconToDataUrl(icon);

      // 3. Output handling
      cleanupTempFile(tempIconPath);
      return result;
    }
  } catch (e) {
    cleanupTempFile(tempIconPath);
  }

  return undefined;
}

/**
 * Extracts icon by reading Info.plist and finding the icon file.
 * @param appPath Path to the .app bundle
 * @returns Data URL string or undefined if extraction fails
 */
function extractIconFromPlist(appPath: string): string | undefined {
  // 1. Input handling
  const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');

  // 2. Core processing
  try {
    if (!fs.existsSync(infoPlistPath)) return undefined;

    const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
    const iconMatch = plistContent.match(/<key>CFBundleIconFile<\/key>\s*<string>([^<]+)<\/string>/);

    if (!iconMatch) return undefined;

    let iconFileName = iconMatch[1];
    if (!iconFileName.endsWith('.icns')) {
      iconFileName += '.icns';
    }

    const iconPath = path.join(appPath, 'Contents', 'Resources', iconFileName);
    if (fs.existsSync(iconPath)) {
      const iconBuffer = fs.readFileSync(iconPath);
      const icon = nativeImage.createFromBuffer(iconBuffer);
      return convertIconToDataUrl(icon);
    }
  } catch (e) {
    // Continue to next method
  }

  // 3. Output handling
  return undefined;
}

/**
 * Tries to find icon using common icon file names.
 * @param appPath Path to the .app bundle
 * @returns Data URL string or undefined if no icon found
 */
function extractIconByCommonNames(appPath: string): string | undefined {
  // 1. Input handling
  const commonIconNames = ['AppIcon.icns', 'app.icns', 'icon.icns'];
  const resourcesPath = path.join(appPath, 'Contents', 'Resources');

  // 2. Core processing
  if (!fs.existsSync(resourcesPath)) return undefined;

  for (const iconName of commonIconNames) {
    try {
      const iconPath = path.join(resourcesPath, iconName);
      if (fs.existsSync(iconPath)) {
        const iconBuffer = fs.readFileSync(iconPath);
        const icon = nativeImage.createFromBuffer(iconBuffer);
        const result = convertIconToDataUrl(icon);
        if (result) return result;
      }
    } catch (e) {
      // Continue trying other names
    }
  }

  // 3. Output handling
  return undefined;
}

/**
 * Extracts icon using Electron's getFileIcon API.
 * @param appPath Path to the application file
 * @returns Data URL string or undefined if extraction fails
 */
async function extractIconWithElectron(appPath: string): Promise<string | undefined> {
  // 1. Input handling
  if (appPath.endsWith('.app')) return undefined;

  // 2. Core processing
  try {
    const icon = await app.getFileIcon(appPath, { size: 'normal' });
    return convertIconToDataUrl(icon);
  } catch (e) {
    // Final fallback failed
  }

  // 3. Output handling
  return undefined;
}

/**
 * Extract icon from macOS application as data URL.
 * @param appPath Path to the application
 * @returns Data URL string or undefined if no icon found
 */
async function getIconDataUrl(appPath: string): Promise<string | undefined> {
  // 1. Input handling
  if (!appPath) return undefined;

  // 2. Core processing
  if (appPath.endsWith('.app')) {
    // Try multiple extraction methods for .app bundles
    const sipsResult = await extractIconWithSips(appPath);
    if (sipsResult) return sipsResult;

    const plistResult = extractIconFromPlist(appPath);
    if (plistResult) return plistResult;

    const commonNamesResult = extractIconByCommonNames(appPath);
    if (commonNamesResult) return commonNamesResult;
  } else {
    // For non-.app files, use Electron's API
    const electronResult = await extractIconWithElectron(appPath);
    if (electronResult) return electronResult;
  }

  // 3. Output handling - no icon found
  return undefined;
}

/**
 * Determines if a directory entry is a valid macOS application.
 * @param entry Directory entry to check
 * @returns True if entry is an .app directory
 */
function isValidAppEntry(entry: fs.Dirent): boolean {
  return entry.isDirectory() && entry.name.endsWith('.app');
}

/**
 * Resolves the final executable path for a macOS application.
 * @param appPath Path to the .app bundle
 * @param appName Name of the application
 * @returns Resolved executable path or original app path
 */
function resolveAppExecutablePath(appPath: string, appName: string): string {
  // 1. Input handling
  const executablePath = path.join(appPath, 'Contents', 'MacOS', appName);

  // 2. Core processing
  try {
    if (fs.existsSync(executablePath)) {
      return executablePath;
    }
  } catch {
    // Keep app bundle path if executable not found
  }

  // 3. Output handling
  return appPath;
}

/**
 * Creates an InstalledApp object from app metadata.
 * @param appPath Path to the application
 * @param appName Name of the application
 * @param finalPath Resolved executable path
 * @param sourceDir Source directory for determining app source
 * @returns InstalledApp object with or without icon
 */
async function createAppEntry(
  appPath: string,
  appName: string,
  finalPath: string,
  sourceDir: string
): Promise<InstalledApp> {
  // 1. Input handling
  const baseApp: Omit<InstalledApp, 'iconDataUrl'> = {
    id: finalPath,
    name: appName,
    path: finalPath,
    source: sourceDir.includes('/System/') ? 'system' : 'applications',
  };

  // 2. Core processing
  try {
    const iconDataUrl = await getIconDataUrl(appPath);
    return { ...baseApp, iconDataUrl };
  } catch (e) {
    return baseApp;
  }
}

/**
 * Processes all apps in a single directory.
 * @param dir Directory path to scan
 * @returns Array of apps found in the directory
 */
async function processAppsInDirectory(dir: string): Promise<InstalledApp[]> {
  // 1. Input handling
  const apps: InstalledApp[] = [];

  // 2. Core processing
  try {
    if (!fs.existsSync(dir)) return apps;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!isValidAppEntry(entry)) continue;

      const appPath = path.join(dir, entry.name);
      const appName = entry.name.replace('.app', '');
      const finalPath = resolveAppExecutablePath(appPath, appName);
      const app = await createAppEntry(appPath, appName, finalPath, dir);

      apps.push(app);
    }
  } catch (e) {
    // ignore missing or inaccessible directories
  }

  // 3. Output handling
  return apps;
}

/**
 * Scans macOS applications from standard directories.
 * @returns Array of discovered macOS applications
 */
export async function scanMacOSApps(): Promise<InstalledApp[]> {
  // 1. Input handling
  const allApps: InstalledApp[] = [];

  // 2. Core processing
  for (const dir of MACOS_APP_LOCATIONS) {
    const dirApps = await processAppsInDirectory(dir);
    allApps.push(...dirApps);
  }

  // 3. Output handling
  return allApps;
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
