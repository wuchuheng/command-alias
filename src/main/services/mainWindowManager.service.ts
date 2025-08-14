/**
 * Functional window management service
 * Provides pure functions for window lifecycle management
 */

import { BrowserWindow } from 'electron';
import { createWindow } from '../windows/windowFactory';
import { logger } from '../utils/logger';

let mainWindow: BrowserWindow | null = null;

const closeEventIntercept = (e: Electron.Event) => {
  if (mainWindow) {
    e.preventDefault();
    logger.info(`The close event was triggered, but the main window is hidden instead of closed`);
    mainWindow.hide();
  }
};

/**
 * Creates a managed main window if it doesn't already exist.
 * @returns {BrowserWindow }
 */
export const create = (): BrowserWindow => {
  if (mainWindow) {
    logger.warn('Main window already exists, not creating a new one');
    return mainWindow;
  }
  logger.info('Creating main window');
  mainWindow = createWindow();

  mainWindow.on('close', closeEventIntercept);

  return mainWindow;
};

export const getMainWindow = (): BrowserWindow => {
  if (!mainWindow) {
    logger.warn('Main window is not created yet');
    return create();
  }
  return mainWindow;
};

/**
 * Closes the main window if it exists.
 * @returns {void}
 */
export const close = (): void => {
  if (mainWindow) {
    logger.info('Hiding main window instead of closing');
    mainWindow.hide();
    return;
  }

  logger.warn('No main window to close');
};

/**
 * Hides the main window if it exists.
 * @returns {void}
 */
export const hide = (): void => {
  if (!mainWindow) {
    logger.warn('No main window to hide');
    return;
  }
  logger.info('Hiding main window');

  mainWindow.hide();
};

/**
 * Minimizes the main window if it exists.
 * @returns {void}
 */
export const minimize = (): void => {
  if (!mainWindow) {
    logger.warn('No main window to minimize');
    return;
  }
  logger.info('Minimizing main window');

  mainWindow.minimize();
};

export const maximize = (): void => {
  if (!mainWindow) {
    logger.warn('No main window to maximize');
    return;
  }
  logger.info('Maximizing main window');

  mainWindow.maximize();
};

/**
 * Force closes the main window if it exists.
 * @returns {void}
 */
export const forceClose = (): void => {
  if (!mainWindow) {
    logger.warn('No main window to force close');
    return;
  }
  logger.info('Force closing main window');

  mainWindow.removeListener('close', closeEventIntercept);
  mainWindow.close();
  mainWindow = null;
};
