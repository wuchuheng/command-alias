import { config } from '../../shared/config';
import { logger } from '../utils/logger';
import { scanInstalledApps, clearAppsCache, browseForExecutable } from '../services/app.service/apps.service';

/** IPC handler for retrieving cached installed applications. */
config.apps.getInstalledApps.handle(async () => {
  try {
    return await scanInstalledApps(false);
  } catch (e) {
    logger.error('getInstalledApps failed', e);
    throw e;
  }
});

/** IPC handler for refreshing the installed applications cache. */
config.apps.refreshInstalledApps.handle(async () => {
  try {
    clearAppsCache();
    return await scanInstalledApps(true);
  } catch (e) {
    logger.error('refreshInstalledApps failed', e);
    throw e;
  }
});

/** IPC handler for opening a file dialog to browse for executable files. */
config.apps.browseForExecutable.handle(async () => {
  try {
    return await browseForExecutable();
  } catch (e) {
    logger.error('browseForExecutable failed', e);
    throw e;
  }
});
