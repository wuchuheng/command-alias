import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { logger } from '../../utils/logger';
import { productName } from '@/../package.json';
import { isAutoLaunchEnabled } from '../autolaunch.service';
import {
  createMainActionMenuItems,
  createSettingsSubmenu,
  createHelpSubmenu,
  createFooterMenuItems,
  createFallbackMenu,
} from './menu-builders';

let tray: Tray | null = null;

/**
 * Creates and configures the system tray icon with modern context menu.
 * @param mainWindow - The main application window
 */
export function createTray(mainWindow: BrowserWindow) {
  // 1. Input handling
  if (!mainWindow) {
    logger.error('Cannot create tray without main window');
    return;
  }

  // 2. Core processing
  const icon = createTrayIcon();

  if (!icon) {
    logger.error('Failed to create tray icon');
    return;
  }

  tray = new Tray(icon);

  // 2.1 Build comprehensive context menu
  buildContextMenu(mainWindow);

  // 2.2 Setup tray interactions with platform-aware tooltip
  const platform = process.platform;
  const shortcutText = platform === 'darwin' ? 'Ctrl+Space' : 'Ctrl+Space';
  tray.setToolTip(`${productName} - ${shortcutText} to open command palette`);

  // 2.3 Handle tray click events with cross-platform support
  setupTrayEventHandlers(mainWindow);

  // 3. Output handling
  logger.info('System tray created successfully');
}

/**
 * Creates the tray icon with cross-platform support and proper sizing.
 * Uses dedicated tray icons optimized for each platform.
 * @returns The native image for the tray icon, or null if failed
 */
function createTrayIcon(): Electron.NativeImage | null {
  // 1. Input handling - Determine platform-specific tray icon path
  const platform = process.platform;
  let iconPath: string;

  const trayIconNames = {
    darwin: 'assets/genLogo/tray/tray-icon-darwin-22x22.png',
    win32: 'assets/genLogo/tray/tray-icon-win32-16x16.png',
    linux: 'assets/genLogo/tray/tray-icon-linux-22x22.png',
    universal: 'assets/genLogo/tray/tray-icon-22x22.png',
  };

  if (app.isPackaged) {
    // 1.1 Production: Use platform-specific tray icons with size indicators
    switch (platform) {
      case 'darwin':
        iconPath = path.join(process.resourcesPath, trayIconNames.darwin);
        break;
      case 'win32':
        iconPath = path.join(process.resourcesPath, trayIconNames.win32);
        break;
      case 'linux':
        iconPath = path.join(process.resourcesPath, trayIconNames.linux);
        break;
      default: // linux and others
        logger.warn(`Unsupported platform: ${platform}`);
        iconPath = path.join(process.resourcesPath, trayIconNames.universal);
    }
  } else {
    // 1.2 Development: Use platform-specific tray icons with size indicators
    switch (platform) {
      case 'darwin':
        iconPath = path.join(__dirname, `../../src/renderer/${trayIconNames.darwin}`);
        break;
      case 'win32':
        iconPath = path.join(__dirname, `../../src/renderer/${trayIconNames.win32}`);
        break;
      case 'linux':
        iconPath = path.join(__dirname, `../../src/renderer/${trayIconNames.linux}`);
        break;
      default:
        logger.warn(`Unsupported platform: ${platform}`);
        iconPath = path.join(__dirname, `../../src/renderer/${trayIconNames.universal}`);
    }
  }

  // 1.3 Check if tray icon exists, with intelligent fallback strategy
  if (!fs.existsSync(iconPath)) {
    logger.warn(`Tray icon not found: ${iconPath}`);
    throw new Error(`Tray icon not found: ${iconPath}`);
  }

  // 2. Core processing - Create icon with platform-specific configuration
  logger.info(`Tray icon path (${platform}): ${iconPath}`);
  try {
    const icon = nativeImage.createFromPath(iconPath);
    const iconSize = icon.getSize();

    logger.info(`Tray icon loaded: ${iconSize.width}x${iconSize.height}, empty=${icon.isEmpty()}`);

    if (icon.isEmpty()) {
      logger.error(`Tray icon is empty: ${iconPath}`);
      return null;
    }

    // 2.1 For macOS, use regular icon without template mode for now
    // Template mode can cause black squares if the icon isn't designed for it
    if (platform === 'darwin') {
      logger.info('Using regular macOS tray icon (16x16) without template mode');
    }

    return icon;
  } catch (error) {
    logger.error('Failed to load tray icon:', error);
    return null;
  }
}

/**
 * Sets up event handlers for tray interactions with cross-platform support.
 * @param mainWindow - The main application window
 */
function setupTrayEventHandlers(mainWindow: BrowserWindow): void {
  if (!tray) return;

  const platform = process.platform;

  // Handle left click - behavior varies by platform
  tray.on('click', () => {
    logger.info('Tray icon clicked - showing main window');

    if (platform === 'darwin') {
      // macOS: Toggle window visibility on click
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      // Windows/Linux: Always show and focus
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Handle right click - rebuild menu (to ensure fresh state)
  tray.on('right-click', () => {
    logger.info('Tray icon right-clicked - rebuilding menu');
    buildContextMenu(mainWindow);
  });

  // macOS: Handle double-click for additional interaction
  if (platform === 'darwin') {
    tray.on('double-click', () => {
      logger.info('Tray icon double-clicked - ensuring window visibility');
      mainWindow.show();
      mainWindow.focus();
    });
  }
}

/**
 * Builds the context menu for the tray icon with dynamic content.
 * @param mainWindow - The main application window
 */
export async function buildContextMenu(mainWindow: BrowserWindow): Promise<void> {
  if (!tray) return;

  try {
    // 1. Input handling - Get current state
    const autoLaunchEnabled = await isAutoLaunchEnabled();
    const isWindowVisible = mainWindow.isVisible();

    // 2. Core processing - Build menu template from components
    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      ...createMainActionMenuItems(mainWindow, isWindowVisible),
      {
        label: '⚙️ Settings',
        submenu: createSettingsSubmenu(mainWindow, autoLaunchEnabled),
      },
      {
        label: '❓ Help',
        submenu: createHelpSubmenu(mainWindow),
      },
      ...createFooterMenuItems(),
    ];

    // 2.1 Create and set the context menu
    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    tray.setContextMenu(contextMenu);

    // 3. Output handling
    logger.verbose('Tray context menu updated successfully');
  } catch (error) {
    logger.error('Failed to build context menu:', error);
    // Fallback to simple menu
    const fallbackMenu = Menu.buildFromTemplate(createFallbackMenu(mainWindow));
    tray.setContextMenu(fallbackMenu);
  }
}

/**
 * Destroys the tray icon and cleans up resources.
 */
export function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
    logger.info('System tray destroyed');
  }
}
