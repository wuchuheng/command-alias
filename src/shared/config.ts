import { Welcome } from 'src/main/database/entities/welcom';
import { BootloadingProgressing } from '../types/electron';
import { StrictConfig } from './config-utils';
import { createIpcChannel } from './ipc-channel';
import createSubscriptionChannel from './ipc-subscription';
import { KeyBinding } from 'src/main/database/entities/KeyBinding';

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
    getKeyBindings: createIpcChannel<void, KeyBinding[]>('spaceTrigger/getKeyBindings'),

    addBinding: createIpcChannel<Omit<KeyBinding, 'id'>, void>('spaceTrigger/addBinding'),

    toggleApp: createIpcChannel<number, void>('spaceTrigger/triggerAction'),

    hideCommandPalette: createIpcChannel<void, void>('spaceTrigger/hideCommandPalette'),
  },
};
