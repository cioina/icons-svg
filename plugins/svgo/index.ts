import { type Config, optimize } from 'svgo';
import { createTrasformStreamAsync } from '../creator';

export const optimizeSvg = (options: Config) => {
  return createTrasformStreamAsync(async (before) => {
    const { data } = await optimize(before, options);
    return data;
  });
};
