import { BrowserWindow } from 'electron';
import { logger } from '../utils/logger';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createWindow = (): BrowserWindow => {
  logger.info('Creating main window');

  try {
    // Create the browser window.
    logger.info(`Creating BrowserWindow with preload path: ${MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY}`);
    logger.info(`Main window entry: ${MAIN_WINDOW_WEBPACK_ENTRY}`);

    const mainWindow = new BrowserWindow({
      height: 800 * 1.5,
      width: 1200 * 1.5,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        contextIsolation: true,
        nodeIntegration: false,
      },
      // Use frameless window for custom title bar
      frame: false,
      // No need for autoHideMenuBar with frameless window
      // autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      // Add background color to prevent white flash during loading
      backgroundColor: '#1e1e2e',
    });

    logger.info('BrowserWindow created successfully');

    // Hide the menu bar completely
    mainWindow.setMenuBarVisibility(false);
    logger.info('Menu bar visibility set to false');

    // Verify contentView is created
    logger.info(`Main window contentView exists: ${!!mainWindow.contentView}`);

    // Log some window properties for debugging
    logger.info(`Window bounds: ${JSON.stringify(mainWindow.getBounds())}`);
    logger.info(`Window is visible: ${mainWindow.isVisible()}`);
    logger.info(`Window is minimized: ${mainWindow.isMinimized()}`);
    logger.info(`Window is maximized: ${mainWindow.isMaximized()}`);
    logger.info(`Window is fullscreen: ${mainWindow.isFullScreen()}`);

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    logger.info(`Loading URL: ${MAIN_WINDOW_WEBPACK_ENTRY}`);

    // Open the DevTools in development mode only
    if (process.env.NODE_ENV === 'development') {
      logger.info('Opening DevTools in development mode');
      mainWindow.webContents.openDevTools();
    }

    // Log when the window is ready to show
    mainWindow.once('ready-to-show', () => {
      logger.info('Main window is ready to show');
    });

    // Log window lifecycle events
    mainWindow.on('show', () => {
      logger.info('Main window shown');
    });

    mainWindow.on('hide', () => {
      logger.info('Main window hidden');
    });

    mainWindow.on('focus', () => {
      logger.info('Main window focused');
    });

    mainWindow.on('blur', () => {
      logger.info('Main window blurred');
    });

    mainWindow.on('close', () => {
      logger.info('Main window closing');
    });

    return mainWindow;
  } catch (error) {
    logger.error(`Error creating main window: ${error instanceof Error ? error.message : String(error)}`);
    logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack available'}`);
    throw error;
  }
};
