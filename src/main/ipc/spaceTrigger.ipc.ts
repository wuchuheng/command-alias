import { config } from '../../shared/config';
import { SpaceTriggerService } from '../services/spaceTrigger.service';
import { logger } from '../utils/logger';

const spaceTriggerService = new SpaceTriggerService();

config.spaceTrigger.getKeyBindings.handle(async () => {
  try {
    // 1. Input handling - No parameters to validate

    // 2. Core processing - Get bindings from service
    const bindings = await spaceTriggerService.getKeyBindings();

    // 3. Output handling
    return bindings;
  } catch (error) {
    logger.error('Failed to handle getKeyBindings request', error);
    throw error;
  }
});
