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
 * Extract icon from macOS application as data URL.
 * @param appPath Path to the application
 * @returns Data URL string or undefined if no icon found
 */
async function getIconDataUrl(appPath: string): Promise<string | undefined> {
  // 1. Input handling
  if (!appPath) return undefined;

  try {
    // 2. Core processing
    // 2.1 Use native macOS sips command to extract icon from .app bundles
    if (appPath.endsWith('.app')) {
      try {
        // Create a temporary file for the converted icon
        const tempIconPath = path.join(os.tmpdir(), `app_icon_${Date.now()}.png`);

        // Use sips to extract the icon from the app bundle
        const sipsCommand = `sips -s format png "${appPath}/Contents/Resources/$(defaults read "${appPath}/Contents/Info" CFBundleIconFile 2>/dev/null || echo "AppIcon").icns" --out "${tempIconPath}" 2>/dev/null`;

        try {
          execSync(sipsCommand, { timeout: 5000 });

          // Check if the icon file was created
          if (fs.existsSync(tempIconPath)) {
            // Read the PNG file and convert to data URL
            const iconBuffer = fs.readFileSync(tempIconPath);
            const icon = nativeImage.createFromBuffer(iconBuffer);

            // Clean up temp file
            try {
              fs.unlinkSync(tempIconPath);
            } catch (e) {
              // Ignore cleanup errors
            }

            if (icon && !icon.isEmpty()) {
              const resized = icon.resize({ width: 32, height: 32 });
              return resized.toDataURL();
            }
          }
        } catch (e) {
          // Clean up temp file on error
          try {
            if (fs.existsSync(tempIconPath)) {
              fs.unlinkSync(tempIconPath);
            }
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      } catch (e) {
        // Continue to fallback methods
      }

      // 2.2 Fallback: Try reading icon file directly
      try {
        const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
        if (fs.existsSync(infoPlistPath)) {
          const plistContent = fs.readFileSync(infoPlistPath, 'utf8');

          // Simple regex to find CFBundleIconFile
          const iconMatch = plistContent.match(/<key>CFBundleIconFile<\/key>\s*<string>([^<]+)<\/string>/);
          if (iconMatch) {
            let iconFileName = iconMatch[1];

            // Add .icns extension if not present
            if (!iconFileName.endsWith('.icns')) {
              iconFileName += '.icns';
            }

            // Try to find the icon in Resources directory
            const iconPath = path.join(appPath, 'Contents', 'Resources', iconFileName);
            if (fs.existsSync(iconPath)) {
              // Read the .icns file directly
              const iconBuffer = fs.readFileSync(iconPath);
              const icon = nativeImage.createFromBuffer(iconBuffer);
              if (icon && !icon.isEmpty()) {
                const resized = icon.resize({ width: 32, height: 32 });
                return resized.toDataURL();
              }
            }
          }
        }
      } catch (e) {
        // Continue to fallback
      }

      // 2.3 Fallback: try common icon names in Resources
      const commonIconNames = ['AppIcon.icns', 'app.icns', 'icon.icns'];
      const resourcesPath = path.join(appPath, 'Contents', 'Resources');

      if (fs.existsSync(resourcesPath)) {
        for (const iconName of commonIconNames) {
          try {
            const iconPath = path.join(resourcesPath, iconName);
            if (fs.existsSync(iconPath)) {
              // Read the .icns file directly
              const iconBuffer = fs.readFileSync(iconPath);
              const icon = nativeImage.createFromBuffer(iconBuffer);
              if (icon && !icon.isEmpty()) {
                const resized = icon.resize({ width: 32, height: 32 });
                return resized.toDataURL();
              }
            }
          } catch (e) {
            // Continue trying other names
          }
        }
      }
    }

    // 2.4 Final fallback: for non-.app files, try Electron's getFileIcon
    if (!appPath.endsWith('.app')) {
      try {
        const icon = await app.getFileIcon(appPath, { size: 'normal' });
        if (icon && !icon.isEmpty()) {
          const resized = icon.resize({ width: 32, height: 32 });
          return resized.toDataURL();
        }
      } catch (e) {
        // Final fallback failed
      }
    }
  } catch (e) {
    // ignore icon failures
  }

  // 3. Output handling - no icon found
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
