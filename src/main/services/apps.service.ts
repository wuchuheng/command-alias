import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { logger } from '../utils/logger';

export type InstalledApp = {
  id: string;
  name: string;
  path: string; // resolved executable path
  iconDataUrl?: string;
  source: 'programdata' | 'appdata';
};

let cachedApps: InstalledApp[] | null = null;
let lastScanAt = 0;

const START_MENU_LOCATIONS = [
  () => path.join(process.env.ProgramData || 'C:/ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
  () => path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
];

function safeReaddirRecursive(dir: string, results: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        safeReaddirRecursive(full, results);
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    // ignore missing or inaccessible dirs
  }
  return results;
}

async function resolveLnkTarget(lnkPath: string): Promise<string | null> {
  try {
    // windows-shortcuts does not have types; require dynamically
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require('windows-shortcuts');
    const target: string | null = await new Promise(resolve => {
      try {
        ws.query(lnkPath, (err: Error | null, data: { target?: string }) => {
          if (err) return resolve(null);
          resolve(data && data.target ? data.target : null);
        });
      } catch (e) {
        resolve(null);
      }
    });
    return target && typeof target === 'string' ? target : null;
  } catch (e) {
    return null;
  }
}

async function getIconDataUrl(exePath: string): Promise<string | undefined> {
  try {
    // Ensure app is ready before calling getFileIcon
    if (!app.isReady()) {
      await app.whenReady();
    }
    const icon = await app.getFileIcon(exePath, { size: 'normal' });
    if (icon && !icon.isEmpty()) {
      // Downscale to 32x32 if very large to reduce IPC payload
      const resized = icon.resize({ width: 32, height: 32 });
      return resized.toDataURL();
    }
  } catch (e) {
    // ignore icon failures
  }
  return undefined;
}

function dedupeByPath(apps: InstalledApp[]): InstalledApp[] {
  const seen = new Map<string, InstalledApp>();
  for (const a of apps) {
    const key = a.path.toLowerCase();
    if (!seen.has(key)) seen.set(key, a);
  }
  return Array.from(seen.values());
}

export async function scanInstalledApps(force = false): Promise<InstalledApp[]> {
  const now = Date.now();
  if (!force && cachedApps && now - lastScanAt < 5 * 60 * 1000) {
    return cachedApps;
  }

  const candidates: { name: string; source: InstalledApp['source']; lnkPath: string }[] = [];
  for (const locFn of START_MENU_LOCATIONS) {
    const base = locFn();
    const files = safeReaddirRecursive(base);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.lnk') {
        const name = path.basename(file, ext);
        candidates.push({ name, source: base.includes('ProgramData') ? 'programdata' : 'appdata', lnkPath: file });
      }
    }
  }

  const resolved: InstalledApp[] = [];
  for (const c of candidates) {
    const target = await resolveLnkTarget(c.lnkPath);
    if (!target) continue;
    const ext = path.extname(target).toLowerCase();
    if (ext !== '.exe' && ext !== '.bat' && ext !== '.cmd') continue;
    const name = c.name || path.basename(target, ext);
    try {
      const iconDataUrl = await getIconDataUrl(target);
      resolved.push({ id: target, name, path: target, iconDataUrl, source: c.source });
    } catch (e) {
      resolved.push({ id: target, name, path: target, source: c.source });
    }
  }

  const unique = dedupeByPath(resolved).sort((a, b) => a.name.localeCompare(b.name));
  cachedApps = unique;
  lastScanAt = now;
  logger.info(`Scanned installed apps: ${unique.length} items`);
  return unique;
}

export function clearAppsCache() {
  cachedApps = null;
  lastScanAt = 0;
}
