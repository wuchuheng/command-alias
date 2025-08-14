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

  // 2.2 Setup tray interactions
  tray.setToolTip(`${productName} - Ctrl+Space to open command palette`);

  // 2.3 Handle tray click events
  setupTrayEventHandlers(mainWindow);

  // 3. Output handling
  logger.info('System tray created successfully');
}

/**
 * Creates the tray icon with fallback handling.
 * @returns The native image for the tray icon, or null if failed
 */
function createTrayIcon(): Electron.NativeImage | null {
  // 1. Input handling - Determine icon path
  let iconPath: string;
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath, 'assets/genLogo/icon.png');
  } else {
    iconPath = path.join(__dirname, '../../src/renderer/assets/genLogo/icon.png');
  }

  logger.info(`Tray icon path: ${iconPath}`);

  if (!fs.existsSync(iconPath)) {
    logger.error(`Tray icon not found at ${iconPath}`);
  }

  // 2. Core processing - Create icon with fallback
  try {
    const icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      logger.warn('Tray icon is empty, creating fallback');
      return nativeImage.createEmpty();
    }
    return icon;
  } catch (error) {
    logger.error('Failed to load tray icon:', error);
    return nativeImage.createEmpty();
  }
}

/**
 * Sets up event handlers for tray interactions.
 * @param mainWindow - The main application window
 */
function setupTrayEventHandlers(mainWindow: BrowserWindow): void {
  if (!tray) return;

  // Handle left click - show main window
  tray.on('click', () => {
    logger.info('Tray icon clicked - showing main window');
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle right click - rebuild menu (to ensure fresh state)
  tray.on('right-click', () => {
    logger.info('Tray icon right-clicked - rebuilding menu');
    buildContextMenu(mainWindow);
  });
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
