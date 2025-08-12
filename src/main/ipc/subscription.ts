import { config } from '../../shared/config';

export const bootloadingSubscription = config.system.bootloading.server();

/**
 * Broadcaster for sequence updates from main to renderer.
 */
export const sequenceBroadcaster = config.spaceboot.onSequenceUpdate.server();
