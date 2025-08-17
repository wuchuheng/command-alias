/* eslint-disable */
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import path from 'path';

const iconDir = path.join(__dirname, 'src/renderer/assets/genLogo');

console.info(`Using logo directory: ${iconDir}`);

const config: ForgeConfig = {
  packagerConfig: {
    icon: path.join(iconDir, 'icon'),
    asar: true,
    extraResource: ['./src/renderer/assets/'],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ setupIcon: path.join(iconDir, 'icon.ico') }),
    new MakerZIP({}, ['darwin', 'win32']),
    new MakerDMG({ icon: path.join(iconDir, 'icon.icns') }),
    new MakerRpm({ options: { icon: path.join(iconDir, 'icon.png') } }),
    new MakerDeb({ options: { icon: path.join(iconDir, 'icon.png') } }),
  ],

  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/renderer.html',
            js: './src/renderer/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload/preload.ts',
            },
          },
        ],
      },
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
