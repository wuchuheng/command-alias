import { globalShortcut } from 'electron';
import { logger } from '../utils/logger';

export class GlobalKeyboardService {
  private isRegistered = false;

  registerSpaceKeyHandler() {
    // 1. Input handling - Check if already registered
    if (this.isRegistered) {
      logger.warn('Space key handler already registered');
      return;
    }

    // 2. Core processing - Register global shortcut
    const ret = globalShortcut.register('Space', () => {
      console.log('hello');
    });

    if (!ret) {
      logger.error('Failed to register space key handler');
      return;
    }

    this.isRegistered = true;
    logger.info('Global space key handler registered');
  }

  unregisterSpaceKeyHandler() {
    if (this.isRegistered) {
      globalShortcut.unregister('Space');
      this.isRegistered = false;
      logger.info('Global space key handler unregistered');
    }
  }
}
