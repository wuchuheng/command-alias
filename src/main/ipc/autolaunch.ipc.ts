import { config } from '../../shared/config';
import { enableAutoLaunch, disableAutoLaunch, isAutoLaunchEnabled } from '../services/autolaunch.service';

export function setupAutoLaunchHandlers() {
  config.commandAlias.setAutoLaunch.handle(async (enable: boolean) => {
    if (enable) {
      await enableAutoLaunch();
    } else {
      await disableAutoLaunch();
    }
  });

  config.commandAlias.getAutoLaunchStatus.handle(async () => {
    return await isAutoLaunchEnabled();
  });
}
