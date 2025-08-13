import { CommandAlias } from 'src/main/database/entities/CommandAlias';
import { Welcome } from 'src/main/database/entities/welcom';

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

      commandAlias: {
        getAlias: () => Promise<CommandAlias[]>;

        addAlias: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;

        toggleApp: (id: number) => Promise<void>;

        hideCommandPalette: () => Promise<void>;

        subscribeToAlias: (callback: (bindings: CommandAlias[]) => void) => () => void;
      };

      apps: {
        getInstalledApps: () => Promise<Array<{ id: string; name: string; path: string; iconDataUrl?: string }>>;
        refreshInstalledApps: () => Promise<Array<{ id: string; name: string; path: string; iconDataUrl?: string }>>;
        browseForExecutable: () => Promise<string | null>;
      };
    };
  }
}
