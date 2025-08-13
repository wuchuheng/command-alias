import type { Configuration } from 'webpack';
import * as path from 'path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
  },
  {
    test: /\.(png|jpg|jpeg|gif|svg)$/,
    type: 'asset/resource',
  }
);

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
