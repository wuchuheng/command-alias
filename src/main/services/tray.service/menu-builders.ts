/**
 * Menu builders for the system tray context menu
 * Handles creation of different menu sections and components
 */

import { app } from 'electron';
import { productName } from '@/../package.json';
import type { BrowserWindow } from 'electron';
import {
  handleToggleWindow,
  handleOpenCommandPalette,
  handleToggleAutoLaunch,
  handleOpenDataFolder,
  handleOpenLogsFolder,
  handleOpenGitHub,
  handleOpenUserGuide,
  handleShowAbout,
  handleRestartApplication,
  handleQuitApplication,
} from './handlers';

import * as mainWindowService from '@/main/services/mainWindowManager.service';

/**
 * Creates the main action menu items for the tray.
 * @param mainWindow - The main application window
 * @param isWindowVisible - Whether the main window is currently visible
 */
export function createMainActionMenuItems(
  mainWindow: BrowserWindow,
  isWindowVisible: boolean
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: '📊 Show Dashboard',
      click: () => handleToggleWindow(mainWindow, isWindowVisible),
      accelerator: 'Ctrl+Shift+D',
    },
    {
      label: '⚡ Open Command Palette',
      click: () => handleOpenCommandPalette(),
      accelerator: 'Ctrl+Space',
    },
    { type: 'separator' },
  ];
}

/**
 * Creates the settings submenu for the tray.
 * @param mainWindow - The main application window
 * @param autoLaunchEnabled - Whether auto-launch is currently enabled
 */
export function createSettingsSubmenu(
  mainWindow: BrowserWindow,
  autoLaunchEnabled: boolean
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: autoLaunchEnabled ? '✅ Start with Windows' : '⭕ Start with Windows',
      click: () => handleToggleAutoLaunch(autoLaunchEnabled, mainWindow),
    },
    { type: 'separator' },
    {
      label: '📁 Open Data Folder',
      click: () => handleOpenDataFolder(),
    },
    {
      label: '📋 Open Logs Folder',
      click: () => handleOpenLogsFolder(),
    },
  ];
}

/**
 * Creates the help submenu for the tray.
 * @param mainWindow - The main application window
 */
export function createHelpSubmenu(mainWindow: BrowserWindow): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: '🌐 GitHub Repository',
      click: () => handleOpenGitHub(),
    },
    {
      label: '📖 User Guide',
      click: () => handleOpenUserGuide(mainWindow),
    },
    {
      label: '⌨️ Keyboard Shortcuts',
      enabled: false,
    },
    {
      label: '   • Ctrl+Space: Command Palette',
      enabled: false,
    },
    {
      label: '   • Ctrl+Shift+D: Toggle Dashboard',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: `ℹ️ About ${productName}`,
      click: () => handleShowAbout(),
    },
  ];
}

/**
 * Creates the footer menu items (restart and quit).
 */
export function createFooterMenuItems(): Electron.MenuItemConstructorOptions[] {
  return [
    { type: 'separator' },
    {
      label: '🔄 Restart Application',
      click: () => handleRestartApplication(),
    },
    {
      label: '❌ Quit',
      click: () => handleQuitApplication(),
      accelerator: 'Ctrl+Q',
    },
  ];
}

/**
 * Creates a fallback menu when the main menu fails to build.
 * @param mainWindow - The main application window
 */
export function createFallbackMenu(mainWindow: BrowserWindow): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Show Dashboard',
      click: () => mainWindow.show(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        mainWindowService.forceClose();
        app.quit();
      },
    },
  ];
}
