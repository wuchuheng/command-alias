import { logger } from '../utils/logger';

/**
 * Sets up all IPC handlers automatically using webpack's require.context
 * @param mainWindow The application's main BrowserWindow instance
 */
export const setupAllIpcHandlers = (): void => {
  logger.info('Setting up all IPC handlers');

  try {
    // Use webpack's require.context to get all IPC module files
    // This will be transformed by webpack during build
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requireIpcModule = (require as any).context('.', false, /\.ipc\.ts$/);

    // Get all the file names that match our pattern
    const ipcModuleFiles = requireIpcModule.keys();

    logger.info(`Found ${ipcModuleFiles.length} IPC modules to load`);

    // For each IPC module file, import and set up the handlers
    ipcModuleFiles.forEach((filename: string) => {
      try {
        // Extract the module name for logging
        const moduleName = filename.replace(/^\.\//, '').replace(/\.ipc\.ts$/, '');

        // Import the module
        requireIpcModule(filename);
        logger.verbose(`${moduleName} IPC handler setup complete`);
      } catch (error) {
        logger.error(`Error setting up IPC handler for ${filename}: ${error.message}`);
        console.log(error.stack);
        if (process.env.NODE_ENV === 'development') {
          process.exit(1);
        }
      }
    });

    logger.info('All IPC handlers set up successfully');
  } catch (error) {
    logger.error(`Failed to set up IPC handlers: ${error.message}`);

    logger.info('Falling back to manual IPC setup');
  }
};
