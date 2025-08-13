import { app, BrowserWindow } from 'electron';
import { setupAllIpcHandlers } from './ipc';
import { createWindow } from './windows/windowFactory';
import { bootload } from './services/bootload.service';
import { initDB } from './database/data-source';
import * as globalHotKey from './services/hotkey.service';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

export const getMainWindow = () => mainWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // 2. Handle the logic.
  // 2.1 Create the main window.
  mainWindow = createWindow();

  // 2.2 Bootload the application (must happen before IPC handlers)
  bootload.register({ title: 'Initializing Database ...', load: initDB });
  await bootload.boot();

  // 2.3 Setup all IPC handlers (after database is initialized)
  setupAllIpcHandlers();

  // 2.4 Register global keyboard handlers
  globalHotKey.registerCtrlSpaceHandler();

  // Cleanup on quit
});

app.on('will-quit', () => globalHotKey.unregisterCtrlSpaceHandler());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});
