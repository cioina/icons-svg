import type { Config } from 'svgo';
import { mergeRight } from 'ramda';
import { base } from './base';

const conf: Config = {
  plugins: [
    ...(base.plugins || []),
    {
      name: 'removeAttrs',
      params: {
        attrs: ['class', 'fill-rule', 'fillRule']
      }
    }
  ]
};
export const remainFillConfig: Config = mergeRight(base, conf);
