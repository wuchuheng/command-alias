import { globalShortcut } from 'electron';
import { logger } from '../utils/logger';
import { createCommandPaletteWindow } from '../windows/windowFactory';

let isRegistered = false;
let commandPaletteWindow: Electron.BrowserWindow | null = null;

export const registerCtrlSpaceHandler = () => {
  // 1. Input handling - Check if already registered
  if (isRegistered) {
    logger.warn('Ctrl+Space key handler already registered');
    return;
  }

  // 2. Core processing - Register global shortcut
  const ret = globalShortcut.register('Ctrl+Space', () => {
    if (commandPaletteWindow && commandPaletteWindow.isVisible()) {
      commandPaletteWindow.hide();
    } else {
      if (!commandPaletteWindow) {
        commandPaletteWindow = createCommandPaletteWindow();
        commandPaletteWindow.on('closed', () => {
          commandPaletteWindow = null;
        });
      }
      commandPaletteWindow.show();
      commandPaletteWindow.focus();
    }
  });

  if (!ret) {
    logger.error('Failed to register Ctrl+Space key handler');
    return;
  }

  isRegistered = true;
  logger.info('Global Ctrl+Space key handler registered');
};

export const unregisterCtrlSpaceHandler = () => {
  if (isRegistered) {
    globalShortcut.unregister('Ctrl+Space');
    isRegistered = false;
    logger.info('Global Ctrl+Space key handler unregistered');
  }

  if (commandPaletteWindow) {
    commandPaletteWindow.close();
    commandPaletteWindow = null;
  }
};

/**
 * Hide the command palette window if it's open.
 */
export const hideCommandPalette = async () => {
  logger.info('Hiding command palette');
  if (commandPaletteWindow) {
    commandPaletteWindow.hide();
  }
};

/**
 * Show the command palette window, creating it if necessary.
 */
export const showCommandPalette = () => {
  logger.info('Showing command palette via programmatic call');
  if (commandPaletteWindow && commandPaletteWindow.isVisible()) {
    commandPaletteWindow.focus();
  } else {
    if (!commandPaletteWindow) {
      commandPaletteWindow = createCommandPaletteWindow();
      commandPaletteWindow.on('closed', () => {
        commandPaletteWindow = null;
      });
    }
    commandPaletteWindow.show();
    commandPaletteWindow.focus();
  }
};
