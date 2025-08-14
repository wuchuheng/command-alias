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
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
      };

      /**
       * Group of system methods
       */
      system: {
        bootloading: (callback: (data: BootloadingProgressing) => void) => () => void;
        getBootloadProgressing: () => Promise<BootloadingProgressing>;
      };

      welcome: {
        getWelcome: () => Promise<Welcome>;
      };

      commandAlias: {
        getAlias: () => Promise<CommandAlias[]>;
        addAlias: (binding: Omit<CommandAlias, 'id'>) => Promise<void>;
        toggleApp: (id: number) => Promise<void>;
        hideCommandPalette: () => Promise<void>;
        subscribeToAlias: (callback: (bindings: CommandAlias[]) => void) => () => void;
        setAutoLaunch: (enable: boolean) => Promise<void>;
        getAutoLaunchStatus: () => Promise<boolean>;
      };

      apps: {
        getInstalledApps: () => Promise<Array<{ id: string; name: string; path: string; iconDataUrl?: string }>>;
        refreshInstalledApps: () => Promise<Array<{ id: string; name: string; path: string; iconDataUrl?: string }>>;
        browseForExecutable: () => Promise<string | null>;
      };
    };
  }
}
