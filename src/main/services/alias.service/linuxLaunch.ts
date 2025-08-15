import * as child_process from 'child_process';
import * as path from 'path';
import { logger } from '../../utils/logger';
import type { CommandAlias } from '../../database/entities/CommandAlias';

/**
 * Check if a Linux application is running using `pgrep`.
 * @param appName Application name or executable name
 * @returns True if the application is running
 */
async function isAppRunning(appName: string): Promise<boolean> {
  // 1. Input handling
  const processName = path.basename(appName);

  // 2. Core processing
  return new Promise(resolve => {
    child_process.exec(`pgrep -f "${processName}"`, (error, stdout) => {
      // 3. Output handling
      resolve(!error && stdout.trim().length > 0);
    });
  });
}

/**
 * Bring a running Linux application to the foreground using wmctrl or xdotool.
 * @param appName Application name or executable name
 */
async function bringToForeground(appName: string): Promise<void> {
  // 1. Input handling
  const processName = path.basename(appName);

  // 2. Core processing - try wmctrl first, fallback to xdotool
  return new Promise((resolve, reject) => {
    // Try wmctrl first (more reliable)
    child_process.exec(`wmctrl -a "${processName}"`, error1 => {
      if (!error1) {
        // 3. Output handling - wmctrl succeeded
        resolve();
        return;
      }

      // Fallback to xdotool
      child_process.exec(`xdotool search --name "${processName}" windowactivate`, error2 => {
        if (!error2) {
          // 3. Output handling - xdotool succeeded
          resolve();
        } else {
          // 3. Output handling - both methods failed
          logger.error(`Failed to bring ${processName} to foreground (tried wmctrl and xdotool)`);
          reject(error2);
        }
      });
    });
  });
}

/**
 * Launch an application on Linux platform.
 * @param binding The command alias binding containing the target application path
 */
export async function launchLinuxApp(binding: CommandAlias): Promise<void> {
  try {
    // 1. Input handling - determine app name and launch method
    const targetPath = binding.target;
    const appName = path.basename(targetPath);

    // 2. Core processing - check if application is running
    const isRunning = await isAppRunning(appName);
    logger.info(`Process check: ${appName} is ${isRunning ? 'running' : 'not running'}`);

    if (!isRunning) {
      // 2.1 Launch the application
      if (targetPath.endsWith('.desktop')) {
        // Use gtk-launch for .desktop files
        child_process.spawn('gtk-launch', [path.basename(targetPath, '.desktop')], {
          detached: true,
          stdio: 'ignore',
        });
      } else {
        // Direct executable launch
        child_process.spawn(targetPath, [], {
          detached: true,
          stdio: 'ignore',
        });
      }
      logger.info(`Launched application: ${appName}`);
    } else {
      // 2.2 Bring existing instance to foreground
      await bringToForeground(appName);
      logger.info(`Brought to foreground: ${appName}`);
    }

    // 3. Output handling - operation completed successfully
  } catch (error) {
    logger.error(`Failed to launch Linux app: ${binding.target}`, error);
    throw error;
  }
}
