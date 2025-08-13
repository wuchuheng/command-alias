import { logger } from '../utils/logger';
import { KeyBinding } from '../database/entities/KeyBinding';
import { getDataSource } from '../database/data-source';

export class SpaceTriggerService {
  private keyBindingRepository = getDataSource().getRepository(KeyBinding);

  async getKeyBindings(): Promise<KeyBinding[]> {
    try {
      // 1. Input handling - No validation needed for simple query

      // 2. Core processing - Fetch all key bindings
      const bindings = await this.keyBindingRepository.find({
        order: { sequence: 'ASC' },
      });

      // 3. Output handling
      return bindings;
    } catch (error) {
      logger.error('Failed to fetch key bindings', error);
      throw error;
    }
  }
}
