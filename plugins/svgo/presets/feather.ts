import type { Config } from 'svgo';
import { mergeRight } from 'ramda';
import { base } from './base';

const conf: Config = {
  plugins: [
    ...(base.plugins || []),
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'class',
          'fill',
          'width',
          'height',
          'stroke',
          'stroke-linecap',
          'stroke-linejoin',
          'stroke-width'
        ]
      }
    }
  ]
};
export const featherConfig: Config = mergeRight(base, conf);
