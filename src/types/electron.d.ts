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

export type GetKeyBindingInput = {
  id: string;
  sequence: string;
  comment?: string;
}[];

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
      spaceTrigger: {
        getKeyBindings: () => Promise<GetKeyBindingInput>;
      };
    };
  }
}
