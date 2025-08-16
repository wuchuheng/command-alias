import { Welcome } from '@/main/database/entities/welcom';
import { BootloadingProgressing } from '../types/electron';
import { StrictConfig } from './config-utils';
import { createIpcChannel } from './ipc-channel';
import createSubscriptionChannel from './ipc-subscription';
import { CommandAlias } from '@/main/database/entities/CommandAlias';

// Use StrictConfig to ensure implementation matches Window["electron"] interface
export const config: StrictConfig = {
  window: {
    minimize: createIpcChannel<void, void>('window/minimize'),
    maximize: createIpcChannel<void, void>('window/maximize'),
    close: createIpcChannel<void, void>('window/close'),
  },

  system: {
    bootloading: createSubscriptionChannel<BootloadingProgressing>('system/bootloading'),
    getBootloadProgressing: createIpcChannel<void, BootloadingProgressing>('system/getBootloadingProcessing'),
    getPlatform: createIpcChannel<void, string>('system/getPlatform'),
  },
  welcome: {
    getWelcome: createIpcChannel<void, Welcome>('welcome/getWelcome'),
  },

  commandAlias: {
    getAlias: createIpcChannel<void, CommandAlias[]>('CommandAlias/getKeyBindings'),
    addAlias: createIpcChannel<Omit<CommandAlias, 'id'>, void>('CommandAlias/addBinding'),
    toggleApp: createIpcChannel<number, void>('CommandAlias/triggerAction'),
    hideCommandPalette: createIpcChannel<void, void>('CommandAlias/hideCommandPalette'),
    subscribeToAlias: createSubscriptionChannel<CommandAlias[]>('CommandAlias/subscribeToKeyBindings'),
    setAutoLaunch: createIpcChannel<boolean, void>('CommandAlias/setAutoLaunch'),
    getAutoLaunchStatus: createIpcChannel<void, boolean>('CommandAlias/getAutoLaunchStatus'),
    remove: createIpcChannel<number, void>('CommandAlias/removeBinding'),
    update: createIpcChannel<CommandAlias, void>('CommandAlias/updateBinding'),
    checkAlias: createIpcChannel<string, string | null>('CommandAlias/checkAlias'),
  },

  apps: {
    getInstalledApps: createIpcChannel<void, Array<{ id: string; name: string; path: string; iconDataUrl?: string }>>(
      'apps/getInstalledApps'
    ),

    refreshInstalledApps: createIpcChannel<
      void,
      Array<{ id: string; name: string; path: string; iconDataUrl?: string }>
    >('apps/refreshInstalledApps'),

    browseForExecutable: createIpcChannel<void, string | null>('apps/browseForExecutable'),
  },
};
