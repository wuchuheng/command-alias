import { logger } from '../../utils/logger';
import { CommandAlias } from '../../database/entities/CommandAlias';
import { Like } from 'typeorm';
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

/**
 * Remove a key binding from the database.
 * @param id The ID of the key binding to remove
 */
export const remove = async (id: number): Promise<void> => {
  const keyBindingRepository = getDataSource().getRepository(CommandAlias);
  try {
    // 1. Input handling - Validate ID
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid alias ID');
    }

    // 2. Core processing - Remove binding from database
    await keyBindingRepository.delete({ id });

    // 3. Output handling - Broadcast updated list to subscribers
    const updatedAliases = await getAlias();
    aliasSubscription.broadcast(updatedAliases);
  } catch (error) {
    logger.error('Failed to remove key binding', error);
    throw error;
  }
};

/**
 * Update an existing key binding in the database.
 * @param newValue The updated key binding data
 */
export const update = async (newValue: CommandAlias) => {
  const keyBindingRepository = getDataSource().getRepository(CommandAlias);
  try {
    // 1. Input handling - Validate new value
    if (!newValue || !newValue.id) {
      throw new Error('Invalid binding');
    }

    // 2. Core processing - Update binding in database
    await keyBindingRepository.update({ id: newValue.id }, newValue);

    // 3. Output handling - Broadcast updated list to subscribers
    const updatedAliases = await getAlias();
    aliasSubscription.broadcast(updatedAliases);
  } catch (error) {
    logger.error('Failed to update key binding', error);
    throw error;
  }
};

/**
 *
 * @param name
 */
/**
 * Checks if an alias exists that starts with the given name.
 * @param name Alias prefix to check
 * @returns The matching alias string, or null if not found
 */
export const checkAlias = async (name: string): Promise<string | null> => {
  const caRepository = getDataSource().getRepository(CommandAlias);
  // 1. Input handling: validate name
  if (!name || typeof name !== 'string') {
    throw new Error('Alias name must be a non-empty string');
  }

  // 2. Core processing: query for alias starting with name (case-insensitive)
  const found = await caRepository.findOne({
    where: { alias: Like(`${name}%`) },
    select: ['alias'],
  });

  // 3. Output handling: return alias or null
  return found?.alias ?? null;
};
