import { config } from '../../shared/config';
import { getMainWindow } from '../main';

/**
 * Minimize window
 */
config.window.minimize.handle(async () => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

/**
 * Maximize/restore window
 */
config.window.maximize.handle(async () => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

/**
 * Close window
 */
config.window.close.handle(async () => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});
