import { Welcome } from 'src/main/database/entities/welcom';
import { KeyBinding } from '@/main/database/entities/KeyBinding';

export type Pagination<T> = {
  page: number;
  total: number;
  limit: number;
  items: T[];
};

export type BootloadingProgressing = {
  progress: number;
  title: string;
};

declare global {
  interface Window {
    electron: {
      /**
       * Group of window methods
       */
      window: {
        /**
         * Minimize the window
         */
        minimize: () => Promise<void>;
        /**
         * Maximize the window
         */
        maximize: () => Promise<void>;

        /**
         * Close the window
         */
        close: () => Promise<void>;
      };

      /**
       * Group of system methods
       */
      system: {
        /**
         * Bootloading method
         * @param callback - Callback function to be called with the bootloading data
         * @returns - Function to stop the bootloading
         */
        bootloading: (callback: (data: BootloadingProgressing) => void) => () => void;

        /**
         * Get the bootloading processing
         * @returns - Bootloading processing data
         */
        getBootloadProgressing: () => Promise<BootloadingProgressing>;
      };

      /**
       * Get the welcome message
       * @returns - Welcome message
       */
      welcome: {
        getWelcome: () => Promise<Welcome>;
      };

      /**
       * Spaceboot domain API for key binding and realtime sequence updates.
       */
      spaceboot: {
        /**
         * Set activation delay (ms).
         */
        setDelay: (delay: number) => Promise<void>;

        /**
         * Get all configured key bindings.
         */
        getKeyBindings: () => Promise<KeyBinding[]>;

        /**
         * Add a new key binding.
         */
        addBinding: (binding: Omit<KeyBinding, 'id'>) => Promise<KeyBinding>;

        /**
         * Subscribe to sequence update stream.
         * @returns unsubscribe function
         */
        onSequenceUpdate: (callback: (sequence: string[]) => void) => () => void;
      };
    };
  }
}
