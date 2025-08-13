import { logger } from '../utils/logger';
import { KeyBinding } from '../database/entities/KeyBinding';
import { getDataSource } from '../database/data-source';
import * as child_process from 'child_process';
import * as path from 'path';

export const getKeyBindings = async (): Promise<KeyBinding[]> => {
  const keyBindingRepository = getDataSource().getRepository(KeyBinding);
  try {
    // 1. Input handling - No validation needed for simple query

    // 2. Core processing - Fetch all key bindings
    const bindings = await keyBindingRepository.find({
      order: { sequence: 'ASC' },
    });

    // 3. Output handling
    return bindings;
  } catch (error) {
    logger.error('Failed to fetch key bindings', error);
    throw error;
  }
};

export const addBinding = async (binding: Omit<KeyBinding, 'id'>) => {
  const keyBindingRepository = getDataSource().getRepository(KeyBinding);
  try {
    const newBinding = keyBindingRepository.create(binding);
    await keyBindingRepository.save(newBinding);
  } catch (error) {
    logger.error('Failed to add key binding', error);
    throw error;
  }
};

export const triggerAction = async (id: number): Promise<void> => {
  const keyBindingRepository = getDataSource().getRepository(KeyBinding);

  // 2. Core processing - Trigger action through repository
  const binding = await keyBindingRepository.findOneBy({ id });
  if (!binding) {
    throw new Error('Key binding not found');
  }

  if (binding.actionType === 'launch-app') {
    await launchApp(binding);
  }

  // 3. Output handling - No specific output
};

/**
 * Check if a Windows process is running using `tasklist`.
 * Expects the executable name without extension (e.g., "chrome").
 *
 * @param executableName - Executable base name without ".exe"
 * @returns True if a matching process exists.
 */
async function isProcessRunning(executableName: string): Promise<boolean> {
  // 1. Input handling
  const image = `${executableName}.exe`;

  // 2. Core processing
  return new Promise(resolve => {
    // Use CSV for predictable parsing; /NH removes header.
    const cmd = `tasklist /FI "IMAGENAME eq ${image}" /FO CSV /NH`;
    child_process.exec(cmd, { windowsHide: true }, (_err, stdout = '') => {
      const firstLine = (stdout || '').trim().split(/\r?\n/).find(Boolean) || '';
      // Match a CSV line starting with the quoted image name; INFO lines are unquoted.
      const hasMatch = firstLine.startsWith('"') && new RegExp(`^"${image.replace('.', '\\.')}"`, 'i').test(firstLine);
      // 3. Output handling
      resolve(hasMatch);
    });
  });
}

/**
 * Execute a PowerShell script safely using -EncodedCommand to avoid quoting issues.
 *
 * @param script - The PowerShell script contents.
 */
function runPowerShell(script: string): Promise<void> {
  // 1. Input handling
  const encoded = Buffer.from(script, 'utf16le').toString('base64');

  // 2. Core processing
  return new Promise((resolve, reject) => {
    child_process.execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
      { windowsHide: true },
      error => {
        // 3. Output handling
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Bring a running Windows app to the foreground and restore if minimized.
 * Uses user32 APIs via PowerShell to work around foreground restrictions.
 *
 * @param executableName - Executable base name without extension (e.g., "chrome").
 */
async function bringToForeground(executableName: string): Promise<void> {
  // 1. Input handling
  const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Win32 {
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
}
"@

$procs = Get-Process -Name "${executableName}" -ErrorAction SilentlyContinue |
         Where-Object { $_.MainWindowHandle -ne 0 }
if (-not $procs) { return }

$main = $procs | Sort-Object StartTime | Select-Object -First 1
$h = $main.MainWindowHandle

# 2. Core processing - restore if minimized and force foreground
if ([Win32]::IsIconic($h)) { [Win32]::ShowWindowAsync($h, 9) | Out-Null } # SW_RESTORE = 9

$fg = [Win32]::GetForegroundWindow()
[int]$fgPid = 0
$fgTid = [Win32]::GetWindowThreadProcessId($fg, [ref]$fgPid)
[int]$targetPid = 0
$targetTid = [Win32]::GetWindowThreadProcessId($h, [ref]$targetPid)

if ($fgTid -ne $targetTid) { [Win32]::AttachThreadInput($targetTid, $fgTid, $true) | Out-Null }
[Win32]::BringWindowToTop($h) | Out-Null
[Win32]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 50
if ($fgTid -ne $targetTid) { [Win32]::AttachThreadInput($targetTid, $fgTid, $false) | Out-Null }

# 3. Output handling - Fallback via AppActivate if needed
$shell = New-Object -ComObject WScript.Shell
if (-not $shell.AppActivate($main.Id)) { $null = $shell.AppActivate($main.MainWindowTitle) }
`;

  // 2. Core processing
  try {
    await runPowerShell(ps);
  } catch (err) {
    // 3. Output handling
    logger.error('Failed to bring to foreground via PowerShell', err);
    throw err;
  }
}

const launchApp = async (binding: KeyBinding) => {
  try {
    // 1. Extract executable name without extension
    const executableName = path.basename(binding.target).replace('.exe', '');

    // 2. Check if any matching processes are running
    const isRunning = await isProcessRunning(executableName);
    logger.info(`Process check: ${executableName} is ${isRunning ? 'running' : 'not running'}`);

    if (!isRunning) {
      // 3. Start the app
      child_process.spawn(binding.target, [], {
        detached: true,
        stdio: 'ignore',
      });
      logger.info(`Launched application: ${executableName}`);
    } else {
      // 4. Bring to foreground
      await bringToForeground(executableName);
      logger.info(`Brought to foreground: ${executableName}`);
    }
  } catch (error) {
    logger.error(`Failed to launch app: ${binding.target}`, error);
  }
};
