import { logger } from '../../utils/logger';
import { CommandAlias } from '../../database/entities/CommandAlias';
import { getDataSource } from '../../database/data-source';
import { aliasSubscription } from '../../ipc/subscription';
import { launchWindowsApp } from './windowsLaunch';
import { launchMacOSApp } from './macOSLaunch';
import { launchLinuxApp } from './linuxLaunch';

/**
 * Get all command aliases from the database.
 * @returns Array of all command aliases ordered by alias name
 */
export const getAlias = async (): Promise<CommandAlias[]> => {
  const keyBindingRepository = getDataSource().getRepository(CommandAlias);
  try {
    // 1. Input handling - No validation needed for simple query

    // 2. Core processing - Fetch all key bindings
    const bindings = await keyBindingRepository.find({
      order: { alias: 'ASC' },
    });

    // 3. Output handling
    return bindings;
  } catch (error) {
    logger.error('Failed to fetch key bindings', error);
    throw error;
  }
};

/**
 * Add a new key binding to the database.
 * @param binding Command alias data without ID
 */
export const addAlias = async (binding: Omit<CommandAlias, 'id'>) => {
  const keyBindingRepository = getDataSource().getRepository(CommandAlias);
  try {
    // 1. Input handling - Create new binding entity
    const newBinding = keyBindingRepository.create(binding);

    // 2. Core processing - Save to database
    await keyBindingRepository.save(newBinding);

    // 3. Output handling - Broadcast updated list to subscribers
    const newAlias = await getAlias();
    aliasSubscription.broadcast(newAlias);
  } catch (error) {
    logger.error('Failed to add key binding', error);
    throw error;
  }
};

/**
 * Trigger an action based on the command alias ID.
 * @param id Command alias ID to trigger
 */
export const triggerAction = async (id: number): Promise<void> => {
  // 1. Input handling - Get repository and find binding
  const keyBindingRepository = getDataSource().getRepository(CommandAlias);
  const binding = await keyBindingRepository.findOneBy({ id });

  if (!binding) {
    throw new Error('Key binding not found');
  }

  // 2. Core processing - Trigger platform-specific action
  if (binding.actionType === 'launch-app') {
    const platform = process.platform;

    // 2. Core processing - Delegate to platform-specific launcher
    try {
      if (platform === 'win32') {
        await launchWindowsApp(binding);
      } else if (platform === 'darwin') {
        await launchMacOSApp(binding);
      } else {
        // Linux and other Unix-like systems
        await launchLinuxApp(binding);
      }
    } catch (error) {
      // 3. Output handling - Log and re-throw error
      logger.error(`Failed to launch app on ${platform}: ${binding.target}`, error);
      throw error;
    }
  }

  // 3. Output handling - No specific output
};
