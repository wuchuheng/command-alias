import { globalShortcut } from 'electron';
import { logger } from '../utils/logger';
let isRegistered = false;

export const registerCtrlSpaceHandler = () => {
  // 1. Input handling - Check if already registered
  if (isRegistered) {
    logger.warn('Ctrl+Space key handler already registered');
    return;
  }

  // 2. Core processing - Register global shortcut
  let count = 0;
  const ret = globalShortcut.register('Ctrl+Space', () => {
    console.log(`hello ${++count} times`);
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
};
