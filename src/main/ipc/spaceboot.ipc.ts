import { config } from '../../shared/config';
import { KeyBinding } from '../database/entities/KeyBinding';
import { spacebootService } from '../services/spaceboot.service';

/**
 * Setup Spaceboot IPC handlers.
 */
// Initialize service on first import
let isInit = false;

const initService = async () => {
  if (isInit) return;

  await spacebootService.init();
  isInit = true;
};

// Handle delay configuration
config.spaceboot.setDelay.handle(async delay => {
  await initService();
  await spacebootService.setDelay(delay);
});

// Get key bindings
config.spaceboot.getKeyBindings.handle(async () => {
  await initService();
  const result: KeyBinding[] = await spacebootService.getKeyBindings();

  return result;
});

// Add a new binding
config.spaceboot.addBinding.handle(async binding => {
  await initService();
  return await spacebootService.addBinding(binding);
});
