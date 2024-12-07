import { dest, src } from 'gulp';
import type { Config } from 'svgo';
import type { SVG2DefinitionOptions } from '../../plugins/svg2Definition';
import rename from 'gulp-rename';
import type { UseTemplatePluginOptions } from '../../plugins/useTemplate';
import { optimizeSvg, svg2Definition, useTemplate } from '../../plugins';

export interface GenerateIconsOptions
  extends SVG2DefinitionOptions,
    UseTemplatePluginOptions {
  from: string[];
  toDir: string;
  svgoConfig: Config;
  filename: (option: { name: string }) => string;
}

export const generateIcons = ({
  from,
  toDir,
  svgoConfig,
  theme,
  extraNodeTransformFactories,
  stringify,
  template,
  mapToInterpolate,
  filename
}: GenerateIconsOptions) =>
  function GenerateIcons() {
    return src(from)
      .pipe(optimizeSvg(svgoConfig))
      .pipe(
        svg2Definition({
          theme,
          extraNodeTransformFactories,
          stringify
        })
      )
      .pipe(useTemplate({ template, mapToInterpolate }))
      .pipe(
        rename((file) => {
          if (file.basename) {
            file.basename = filename({ name: file.basename });
            file.extname = '.ts';
          }
        })
      )
      .pipe(dest(toDir));
  };
