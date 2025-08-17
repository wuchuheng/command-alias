import { app, nativeImage } from 'electron';
import { setupAllIpcHandlers } from './ipc';
import { bootload } from './services/bootload.service';
import { initDB } from './database/data-source';
import * as globalHotKey from './services/hotkey.service';
import { createTray } from './services/tray.service/tray.service';

import { logger } from './utils/logger';
import * as mainWindowService from '@/main/services/mainWindowManager.service';
import { platform } from 'node:os';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // 2. Handle the logic.
  // 2.1 Create the main window and tray
  const mainWindow = mainWindowService.create();
  // mainWindowService.hide();

  createTray(mainWindow);

  // 2.2 Bootload the application (must happen before IPC handlers)
  bootload.register({ title: 'Initializing Database ...', load: initDB });
  await bootload.boot();

  // 2.3 Setup all IPC handlers (after database is initialized)
  setupAllIpcHandlers();

  // 2.4 Initialize auto-launch settings
  const { setupAutoLaunchHandlers } = await import('./ipc/autolaunch.ipc');
  setupAutoLaunchHandlers();

  // 2.5 Register global keyboard handlers
  globalHotKey.registerCtrlSpaceHandler();
});

app.on('will-quit', () => globalHotKey.unregisterCtrlSpaceHandler());

app.on('activate', () => {
  logger.info('Application activated');
});
