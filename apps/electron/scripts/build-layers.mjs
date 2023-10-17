#!/usr/bin/env zx
import 'zx/globals';

import * as esbuild from 'esbuild';

import { config } from './common.mjs';

const NODE_ENV =
  process.env.NODE_ENV === 'development' ? 'development' : 'production';

if (process.platform === 'win32') {
  $.shell = true;
  $.prefix = '';
}

async function buildLayers() {
  const common = config();

  const define = {
    'process.env.NODE_ENV': `"${NODE_ENV}"`,
    'process.env.BUILD_TYPE': `"${process.env.BUILD_TYPE || 'stable'}"`,
  };

  if (process.env.BUILD_TYPE_OVERRIDE) {
    define[
      'process.env.BUILD_TYPE_OVERRIDE'
    ] = `"${process.env.BUILD_TYPE_OVERRIDE}"`;
  }

  await esbuild.build({
    ...common.layers,
    define: define,
  });
}

await buildLayers();
echo('Build layers done');
