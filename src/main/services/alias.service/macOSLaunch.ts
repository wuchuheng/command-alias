import * as child_process from 'child_process';
import * as path from 'path';
import { logger } from '../../utils/logger';
import type { CommandAlias } from '../../database/entities/CommandAlias';

/**
 * Check if a macOS application is running using `pgrep`.
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
 * Bring a running macOS application to the foreground using AppleScript.
 * @param appName Application name or bundle identifier
 */
async function bringToForeground(appName: string): Promise<void> {
  // 1. Input handling
  const processName = path.basename(appName, '.app');

  // 2. Core processing - use AppleScript to activate the application
  const script = `tell application "${processName}" to activate`;

  return new Promise((resolve, reject) => {
    child_process.exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      // 3. Output handling
      if (error) {
        logger.error(`Failed to bring ${processName} to foreground: ${stderr}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Launch an application on macOS platform.
 * @param binding The command alias binding containing the target application path
 */
export async function launchMacOSApp(binding: CommandAlias): Promise<void> {
  try {
    // 1. Input handling - determine app name and launch method
    const targetPath = binding.target;
    const isAppBundle = targetPath.endsWith('.app');
    const appName = isAppBundle ? path.basename(targetPath, '.app') : path.basename(targetPath);

    // 2. Core processing - check if application is running
    const isRunning = await isAppRunning(appName);
    logger.info(`Process check: ${appName} is ${isRunning ? 'running' : 'not running'}`);

    if (!isRunning) {
      // 2.1 Launch the application
      if (isAppBundle) {
        // Use 'open' command for .app bundles
        child_process.spawn('open', ['-a', targetPath], {
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
    logger.error(`Failed to launch macOS app: ${binding.target}`, error);
    throw error;
  }
}
