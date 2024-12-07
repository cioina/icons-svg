import { dest, src } from 'gulp';
import type * as File from 'vinyl';
import { useRender } from '../../plugins';
import type { RenderCustomData } from '../../plugins/render';
import type { IconDefinition } from '../../templates/types';
import type { HelperRenderOptions } from '../../templates/helpers';

export interface GenerateInlineOptions {
  from: string[];
  toDir: (file: File & { _renderData?: RenderCustomData }) => string;
  getIconDefinitionFromSource: (raw: string) => IconDefinition;
  renderOptions?: HelperRenderOptions;
}

export const ExtractRegExp = /({\s*".*});/;

export const generateInline = ({
  from,
  toDir,
  getIconDefinitionFromSource,
  renderOptions = {}
}: GenerateInlineOptions) =>
  function GenerateInline() {
    return src(from)
      .pipe(
        useRender({
          getIconDefinitionFromSource,
          renderOptions
        })
      )
      .pipe(dest(toDir));
  };
