import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Generate all logo assets from the vector SVG logo.
 * - Main logo: @/renderer/assets/logo.png (1024x1024)
 * - Tray icons: @/renderer/assets/genLogo/tray/ (platform-specific)
 */
async function main(): Promise<void> {
  // 1. Input handling
  const projectRoot = path.resolve(__dirname, '..');
  const svgPath = path.join(projectRoot, 'src', 'renderer', 'assets', 'logo.svg');

  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing SVG at ${svgPath}`);
  }

  console.log('🎨 Generating logo assets from SVG...');

  // 2. Core processing
  // 2.1 Generate main logo (1024x1024)
  await generateMainLogo(svgPath, projectRoot);

  // 2.2 Generate platform-specific tray icons
  await generateTrayIcons(svgPath, projectRoot);

  // 3. Output handling
  console.log('✅ All logo assets generated successfully!');
}

/**
 * Generate the main logo PNG (1024x1024) for application branding.
 */
async function generateMainLogo(svgPath: string, projectRoot: string): Promise<void> {
  // 1. Input handling
  const outPngPath = path.join(projectRoot, 'src', 'renderer', 'assets', 'logo.png');

  // 2. Core processing
  console.log('  📏 Generating main logo (1024x1024)...');
  await sharp(svgPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPngPath);

  // 3. Output handling
  console.log(`    ✓ Generated: logo.png`);
}

type TrayIcon = { name: string; size: number; desc: string };

/**
 * Generate platform-specific tray icons optimized for system tray usage.
 * Only generates the 4 files actually used by the tray service.
 */
async function generateTrayIcons(svgPath: string, projectRoot: string): Promise<void> {
  // 1. Input handling
  const trayOutputDir = path.join(projectRoot, 'src', 'renderer', 'assets', 'genLogo', 'tray');

  if (!fs.existsSync(trayOutputDir)) {
    fs.mkdirSync(trayOutputDir, { recursive: true });
  }

  console.log('  🖥️  Generating tray icons...');

  // 2. Core processing - Generate only the 4 files used by tray service
  const icons: TrayIcon[] = [
    { name: 'tray-icon-darwin-22x22.png', size: 22, desc: 'macOS' },
    { name: 'tray-icon-win32-16x16.png', size: 16, desc: 'Windows' },
    { name: 'tray-icon-linux-22x22.png', size: 22, desc: 'Linux' },
    { name: 'tray-icon-22x22.png', size: 22, desc: 'Universal fallback' },
  ];

  for (const icon of icons) {
    const outputPath = path.join(trayOutputDir, icon.name);

    // Generate normal PNG icon for all platforms
    await sharp(svgPath)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`      ✓ ${icon.name} (${icon.size}x${icon.size}) - ${icon.desc}`);
  }

  // 3. Output handling - Clean up any old complex directory structure
  await cleanupUnusedTrayFiles(trayOutputDir, icons);

  console.log(`    ✓ Tray icons saved to: ${trayOutputDir}`);
}

/**
 * Clean up unused tray icon files and directories from previous generations.
 */
async function cleanupUnusedTrayFiles(trayOutputDir: string, icons: TrayIcon[]): Promise<void> {
  // 1. Input handling
  const platformDirs = ['darwin', 'win32', 'linux'];

  // 2. Core processing - Remove platform subdirectories if they exist
  for (const platformDir of platformDirs) {
    const dirPath = path.join(trayOutputDir, platformDir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  // 2.1 Remove any other extra files (keep only the 4 we need)
  const keepFiles = icons.map(icon => icon.name);

  const existingFiles = fs.readdirSync(trayOutputDir);
  for (const file of existingFiles) {
    if (!keepFiles.includes(file)) {
      const filePath = path.join(trayOutputDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
        console.log(`      🗑️  Removed unused: ${file}`);
      }
    }
  }

  // 3. Output handling - logging handled above
}

main().catch(err => {
  console.error('❌ Error generating logo assets:', err);
  process.exit(1);
});
