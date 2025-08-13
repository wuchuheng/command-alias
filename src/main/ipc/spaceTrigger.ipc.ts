import { config } from '../../shared/config';
import * as CommandAliasService from '../services/alias.service';
import { logger } from '../utils/logger';
import * as shortcutService from '@/main/services/hotkey.service';

config.commandAlias.getAlias.handle(async () => {
  try {
    // 1. Input handling - No parameters to validate

    // 2. Core processing - Get bindings from service
    const bindings = await CommandAliasService.getAlias();

    // 3. Output handling
    return bindings;
  } catch (error) {
    logger.error('Failed to handle getKeyBindings request', error);
    throw error;
  }
});

config.commandAlias.addAlias.handle(async binding => {
  try {
    // 1. Input handling - Validate binding
    if (!binding || !binding.sequence || !binding.actionType) {
      throw new Error('Invalid binding');
    }

    // 2. Core processing - Add binding through service
    await CommandAliasService.addAlias(binding);

    // 3. Output handling - No specific output
  } catch (error) {
    logger.error('Failed to handle addBinding request', error);
    throw error;
  }
});

config.commandAlias.toggleApp.handle(async id => {
  try {
    // 1. Input handling - Validate ID
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid action ID');
    }

    // 2. Core processing - Trigger action through service
    await CommandAliasService.triggerAction(id);

    // 3. Output handling - No specific output
  } catch (error) {
    logger.error('Failed to handle triggerAction request', error);
    throw error;
  }
});

config.commandAlias.hideCommandPalette.handle(shortcutService.hideCommandPalette);
