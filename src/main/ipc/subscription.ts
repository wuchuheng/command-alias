import { config } from '../../shared/config';

export const bootloadingSubscription = config.system.bootloading.server();

export const aliasSubscription = config.commandAlias.subscribeToAlias.server();
