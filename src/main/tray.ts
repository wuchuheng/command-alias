import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { logger } from './utils/logger';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  // Get icon path for both dev and production
  let iconPath: string;
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath, 'assets/genLogo/icon.png');
  } else {
    iconPath = path.join(__dirname, '../../src/renderer/assets/genLogo/icon.png');
  }
  logger.info(`Tray icon path: ${iconPath}`);

  if (!fs.existsSync(iconPath)) {
    logger.error(`Tray icon not found at ${iconPath}`);
  }

  // Create tray icon with fallback
  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    console.error('Failed to load tray icon:', error);
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => mainWindow.show(),
    },
    {
      label: 'Quit',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('SpaceBoot');
  tray.on('click', () => mainWindow.show());
}

export function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
