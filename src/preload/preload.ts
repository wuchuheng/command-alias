import { contextBridge } from 'electron';

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { config } from '../shared/config';
import { createPreloadConfig } from '../shared/config-utils';

// Convert the main config to preload-ready format automatically
const preloadConfig = createPreloadConfig(config);

/**
 * Expose the IPC API to the renderer process
 */
contextBridge.exposeInMainWorld('electron', preloadConfig);
