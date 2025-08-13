import { dialog } from 'electron';
import { config } from '../../shared/config';
import { logger } from '../utils/logger';
import { scanInstalledApps, clearAppsCache } from '../services/apps.service';

config.apps.getInstalledApps.handle(async () => {
  try {
    return await scanInstalledApps(false);
  } catch (e) {
    logger.error('getInstalledApps failed', e);
    throw e;
  }
});

config.apps.refreshInstalledApps.handle(async () => {
  try {
    clearAppsCache();
    return await scanInstalledApps(true);
  } catch (e) {
    logger.error('refreshInstalledApps failed', e);
    throw e;
  }
});

config.apps.browseForExecutable.handle(async () => {
  try {
    const res = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Executables', extensions: ['exe', 'bat', 'cmd'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  } catch (e) {
    logger.error('browseForExecutable failed', e);
    throw e;
  }
});
