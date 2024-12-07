import type { Config } from 'svgo';
import { mergeRight } from 'ramda';
import { base } from './base';

const conf: Config = {
  plugins: [
    ...(base.plugins || []),
    {
      name: 'removeAttrs',
      params: {
        attrs: ['class', 'fill', 'fill-rule', 'fillRule']
      }
    }
  ]
};
export const generalConfig: Config = mergeRight(base, conf);
