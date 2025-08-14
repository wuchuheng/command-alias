import { app } from 'electron';
import AutoLaunch from 'auto-launch';

const spacebootAutoLauncher = new AutoLaunch({
  name: app.getName(),
  path: app.getPath('exe'),
  isHidden: true,
});

export async function enableAutoLaunch() {
  try {
    if (!(await spacebootAutoLauncher.isEnabled())) {
      await spacebootAutoLauncher.enable();
    }
  } catch (error) {
    console.error('Failed to enable auto-launch:', error);
  }
}

export async function disableAutoLaunch() {
  try {
    if (await spacebootAutoLauncher.isEnabled()) {
      await spacebootAutoLauncher.disable();
    }
  } catch (error) {
    console.error('Failed to disable auto-launch:', error);
  }
}

export async function isAutoLaunchEnabled(): Promise<boolean> {
  try {
    return await spacebootAutoLauncher.isEnabled();
  } catch (error) {
    console.error('Failed to check auto-launch status:', error);
    return false;
  }
}
