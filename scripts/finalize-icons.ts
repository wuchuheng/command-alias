import fs from 'fs';
import path from 'path';

// 1. Input handling
const projectRoot = path.resolve(__dirname, '..');
const genRoot = path.join(projectRoot, 'src', 'renderer', 'assets', 'genLogo');
const iconsDir = path.join(genRoot, 'icons');
const altRoot = path.join(projectRoot, '%outputDir%');
const altIconsDir = path.join(altRoot, 'icons');

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function moveIfExists(from: string, to: string) {
  if (fs.existsSync(from)) {
    ensureDir(path.dirname(to));
    fs.renameSync(from, to);
  }
}

function rmrf(p: string) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

async function main() {
  // 2. Core processing: Move outputs from either iconsDir or altIconsDir
  const macIcns = path.join(iconsDir, 'mac', 'icon.icns');
  const winIco = path.join(iconsDir, 'win', 'icon.ico');
  const png1024 = path.join(iconsDir, 'png', '1024x1024.png');

  const altMacIcns = path.join(altIconsDir, 'mac', 'icon.icns');
  const altWinIco = path.join(altIconsDir, 'win', 'icon.ico');
  const altPng1024 = path.join(altIconsDir, 'png', '1024x1024.png');

  ensureDir(genRoot);

  moveIfExists(macIcns, path.join(genRoot, 'icon.icns'));
  moveIfExists(winIco, path.join(genRoot, 'icon.ico'));
  moveIfExists(png1024, path.join(genRoot, 'icon.png'));

  moveIfExists(altMacIcns, path.join(genRoot, 'icon.icns'));
  moveIfExists(altWinIco, path.join(genRoot, 'icon.ico'));
  moveIfExists(altPng1024, path.join(genRoot, 'icon.png'));

  // 3. Output handling: Cleanup icon folders
  rmrf(iconsDir);
  rmrf(altIconsDir);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
