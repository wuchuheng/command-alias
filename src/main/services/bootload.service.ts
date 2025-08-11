import { bootloadingSubscription } from '../ipc/subscription';
import { logger } from '../utils/logger';

type TaskItem = {
  title: string;
  load: () => Promise<void>;
};

const bootloadList: TaskItem[] = [];

type BootloadingProcessing = {
  title: string;
  progress: number;
};

let currentProcessing: BootloadingProcessing = {
  title: 'Init...',
  progress: 0,
};

/**
 * Registers a new bootload item.
 * @param item The bootload item to register.
 */

/**
 * Registers a new bootload item.
 * @param item The bootload item to register.
 */
export const bootload = {
  register: (item: TaskItem) => bootloadList.push(item),
  boot: async () => {
    // 2. Handle logic.
    // 2.1 Get the total number of items to load.
    const total = bootloadList.length;
    let current = 0;

    bootloadingSubscription.broadcast(currentProcessing);

    // 2.2 Load each item.
    for (const item of bootloadList) {
      // 2.2.1 Load the task.
      await item.load();
      current++;

      // 2.2.2 Update the progress.
      const progress = Math.floor((current / total) * 100);
      bootloadingSubscription.broadcast({ title: item.title, progress });
      currentProcessing = { title: item.title, progress };

      logger.verbose(`Task loaded: ${item.title} (${progress}%)`);
    }
  },
};

/**
 *
 * @returns The current bootloading progress.
 */
export const getCurrentProcessing = async () => currentProcessing;
