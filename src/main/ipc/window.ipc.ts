import { config } from '../../shared/config';
import * as mainWindowService from '../services/mainWindowManager.service';

/**
 * Minimize window
 */
config.window.minimize.handle(async () => mainWindowService.minimize());

/**
 * Maximize/restore window
 */
config.window.maximize.handle(async () => mainWindowService.maximize());

/**
 * Close window
 */
config.window.close.handle(async () => mainWindowService.hide());
