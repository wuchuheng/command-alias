import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Generate logo.png (1024x1024) from the vector SVG logo.
 * - Input: src/renderer/assets/logo.svg
 * - Output: src/renderer/assets/logo.png (overwrites if exists)
 */
async function main(): Promise<void> {
  // 1. Input handling
  const projectRoot = path.resolve(__dirname, '..');
  const svgPath = path.join(projectRoot, 'src', 'renderer', 'assets', 'logo.svg');
  const outPngPath = path.join(projectRoot, 'src', 'renderer', 'assets', 'logo.png');
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing SVG at ${svgPath}`);
  }

  // 2. Core processing: render SVG to PNG (1024x1024)
  await sharp(svgPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPngPath);

  // 3. Output handling
  // eslint-disable-next-line no-console
  console.log(`Generated logo: ${outPngPath}`);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
