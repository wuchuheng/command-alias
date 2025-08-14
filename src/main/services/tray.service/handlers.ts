/**
 * Event handlers for system tray menu actions
 * Contains all the click handlers and action logic for tray menu items
 */

import { app, shell } from 'electron';
import type { BrowserWindow } from 'electron';
import { logger } from '../../utils/logger';
import * as mainWindowService from '@/main/services/mainWindowManager.service';
import { enableAutoLaunch, disableAutoLaunch } from '../autolaunch.service';
import * as globalHotKey from '../hotkey.service';

/**
 * Handles toggling the main window visibility.
 * @param mainWindow - The main application window
 * @param isWindowVisible - Current visibility state of the window
 */
export function handleToggleWindow(mainWindow: BrowserWindow, isWindowVisible: boolean): void {
  // 1. Input handling
  if (!mainWindow) {
    logger.error('Cannot toggle window - main window is null');
    return;
  }

  // 2. Core processing
  if (isWindowVisible) {
    logger.info('Hiding main window from tray menu');
    mainWindow.hide();
  } else {
    logger.info('Showing main window from tray menu');
    mainWindow.show();
    mainWindow.focus();
  }

  // 3. Output handling - logging is handled above
}

/**
 * Handles opening the command palette.
 */
export function handleOpenCommandPalette(): void {
  // 1. Input handling - no parameters needed

  // 2. Core processing
  logger.info('Opening command palette from tray menu');
  globalHotKey.showCommandPalette();

  // 3. Output handling - logging handled above
}

/**
 * Handles toggling auto-launch setting.
 * @param autoLaunchEnabled - Current auto-launch state
 * @param mainWindow - The main application window (for menu rebuild)
 */
export async function handleToggleAutoLaunch(autoLaunchEnabled: boolean, mainWindow: BrowserWindow): Promise<void> {
  try {
    // 1. Input handling
    if (!mainWindow) {
      logger.error('Cannot toggle auto-launch - main window is null');
      return;
    }

    // 2. Core processing
    if (autoLaunchEnabled) {
      await disableAutoLaunch();
      logger.info('Auto-launch disabled via tray menu');
    } else {
      await enableAutoLaunch();
      logger.info('Auto-launch enabled via tray menu');
    }

    // 3. Output handling - Rebuild menu to reflect new state
    const { buildContextMenu } = await import('./tray.service');
    await buildContextMenu(mainWindow);
  } catch (error) {
    logger.error('Failed to toggle auto-launch:', error);
  }
}

/**
 * Handles opening the data folder.
 */
export async function handleOpenDataFolder(): Promise<void> {
  try {
    // 1. Input handling
    const userDataPath = app.getPath('userData');

    // 2. Core processing
    logger.info(`Opening data folder: ${userDataPath}`);
    await shell.openPath(userDataPath);

    // 3. Output handling - logging handled above
  } catch (error) {
    logger.error('Failed to open data folder:', error);
  }
}

/**
 * Handles opening the logs folder.
 */
export async function handleOpenLogsFolder(): Promise<void> {
  try {
    // 1. Input handling
    const logsPath = app.getPath('logs');

    // 2. Core processing
    logger.info(`Opening logs folder: ${logsPath}`);
    await shell.openPath(logsPath);

    // 3. Output handling - logging handled above
  } catch (error) {
    logger.error('Failed to open logs folder:', error);
  }
}

/**
 * Handles opening the GitHub repository.
 */
export async function handleOpenGitHub(): Promise<void> {
  try {
    // 1. Input handling - hardcoded URL
    const githubUrl = 'https://github.com/wuchuheng/spaceboot';

    // 2. Core processing
    logger.info(`Opening GitHub repository: ${githubUrl}`);
    await shell.openExternal(githubUrl);

    // 3. Output handling - logging handled above
  } catch (error) {
    logger.error('Failed to open GitHub repository:', error);
  }
}

/**
 * Handles opening the user guide.
 * @param mainWindow - The main application window
 */
export function handleOpenUserGuide(mainWindow: BrowserWindow): void {
  // 1. Input handling
  if (!mainWindow) {
    logger.error('Cannot open user guide - main window is null');
    return;
  }

  // 2. Core processing
  // For now, show the main window - could link to documentation later
  logger.info('Opening user guide from tray menu');
  mainWindow.show();
  mainWindow.focus();

  // 3. Output handling - logging handled above
}

/**
 * Handles showing the about dialog.
 */
export function handleShowAbout(): void {
  // 1. Input handling - no parameters needed

  // 2. Core processing
  logger.info('Showing about panel from tray menu');
  app.showAboutPanel();

  // 3. Output handling - logging handled above
}

/**
 * Handles restarting the application.
 */
export function handleRestartApplication(): void {
  // 1. Input handling - no parameters needed

  // 2. Core processing
  logger.info('Restarting application from tray menu');
  app.relaunch();

  // 3. Output handling
  app.exit(0);
}

/**
 * Handles quitting the application.
 */
export function handleQuitApplication(): void {
  // 1. Input handling - no parameters needed

  // 2. Core processing
  logger.info('Quitting application from tray menu');
  mainWindowService.forceClose();

  // 3. Output handling
  app.quit();
}
