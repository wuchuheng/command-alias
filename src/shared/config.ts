import { Welcome } from 'src/main/database/entities/welcom';
import { BootloadingProgressing, GetKeyBindingInput } from '../types/electron';
import { StrictConfig } from './config-utils';
import { createIpcChannel } from './ipc-channel';
import createSubscriptionChannel from './ipc-subscription';

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
  },
  welcome: {
    getWelcome: createIpcChannel<void, Welcome>('welcome/getWelcome'),
  },

  spaceTrigger: {
    getKeyBindings: createIpcChannel<void, GetKeyBindingInput>('spaceTrigger/getKeyBindings'),
  },
};
