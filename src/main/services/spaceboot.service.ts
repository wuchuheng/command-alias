import { KeyBinding } from '../database/entities/KeyBinding';
import * as appConfigRepo from '../database/repositories/appConfig.repository';
import * as keyBindingRepo from '../database/repositories/keyBinding.repository';

/**
 * SpacebootService encapsulates key-binding configuration and activation delay logic.
 */
class SpacebootService {
  /**
   * Cached activation delay in ms.
   */
  private activationDelay = 500;

  /**
   * In-memory cache of key bindings.
   */
  private keyBindings: KeyBinding[] = [];

  /**
   * Initialize service state from database.
   */
  async init(): Promise<void> {
    // 2. Core processing
    const cfg = await appConfigRepo.getOrCreate();
    this.activationDelay = cfg.activationDelay;
    this.keyBindings = await keyBindingRepo.getAll();
  }

  /**
   * Set activation delay (ms) with validation and persistence.
   * @param delay Delay in milliseconds (100-2000)
   */
  async setDelay(delay: number): Promise<void> {
    // 1. Input handling
    if (typeof delay !== 'number' || !Number.isFinite(delay)) {
      throw new Error('Invalid delay');
    }
    if (delay < 100 || delay > 2000) {
      throw new Error('Invalid delay range');
    }

    // 2. Core processing
    this.activationDelay = delay;
    await appConfigRepo.updateDelay(delay);
  }

  /**
   * Get all key bindings.
   */
  async getKeyBindings(): Promise<KeyBinding[]> {
    // 2. Core processing
    if (!this.keyBindings.length) {
      this.keyBindings = await keyBindingRepo.getAll();
    }

    // 3. Output handling
    return this.keyBindings;
  }

  /**
   * Add a new key binding and return the saved entity.
   */
  async addBinding(binding: Omit<KeyBinding, 'id'>): Promise<KeyBinding> {
    // 1. Input handling
    if (!binding || typeof binding.sequence !== 'string' || binding.sequence.trim().length === 0) {
      throw new Error('Invalid binding.sequence');
    }
    if (!['launch-app', 'run-command', 'execute-script'].includes(binding.actionType)) {
      throw new Error('Invalid binding.actionType');
    }
    if (typeof binding.target !== 'string' || binding.target.trim().length === 0) {
      throw new Error('Invalid binding.target');
    }

    // 2. Core processing
    const saved = await keyBindingRepo.create(binding);
    this.keyBindings = await keyBindingRepo.getAll();

    // 3. Output handling
    return saved;
  }
}

export const spacebootService = new SpacebootService();
