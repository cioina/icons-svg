import { parallel, series } from 'gulp';
import {
  clean,
  copy,
  generateEntry,
  generateIcons,
  generateInline
} from './tasks/creators';
import { generalConfig, remainFillConfig } from './plugins/svgo/presets';
import {
  //deleteFeatherAttrsAtTag,
  adjustViewBox,
  assignAttrsAtTag,
  setDefaultColorAtPathTag
} from './plugins/svg2Definition/transforms';
import { twotoneStringify } from './plugins/svg2Definition/stringify';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getIdentifier } from './utils';
import type { IconDefinition } from './templates/types';
import { ExtractRegExp } from './tasks/creators/generateInline';

const iconTemplate = readFileSync(
  resolve(__dirname, './templates/icon.ts.ejs'),
  'utf8'
);

export default series(
  // 1. clean
  clean(['src', 'inline-svg', 'es', 'lib']),

  copy({
    from: ['templates/inline-svg-types/**/*'],
    toDir: 'src/inline-svg'
  }),

  parallel(
    // 2.1 copy helpers.ts, types.ts
    copy({
      from: ['templates/*.ts'],
      toDir: 'src'
    }),

    // 2.2 generate abstract node with the theme "filled"
    generateIcons({
      theme: 'filled',
      from: ['svg/filled/*.svg'],
      toDir: 'src/asn',
      svgoConfig: generalConfig,
      extraNodeTransformFactories: [
        assignAttrsAtTag('svg', { focusable: 'false' }),
        adjustViewBox
      ],
      stringify: JSON.stringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'Filled' }),
        content
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Filled' })
    }),

    // 2.2 generate abstract node with the theme "outlined"
    generateIcons({
      theme: 'outlined',
      from: ['svg/outlined/*.svg'],
      toDir: 'src/asn',
      svgoConfig: generalConfig,
      extraNodeTransformFactories: [
        assignAttrsAtTag('svg', { focusable: 'false' }),
        adjustViewBox
      ],
      stringify: JSON.stringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'Outlined' }),
        content
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Outlined' })
    }),

    // 2.3 generate abstract node with the theme "twotone"
    generateIcons({
      theme: 'twotone',
      from: ['svg/twotone/*.svg'],
      toDir: 'src/asn',
      svgoConfig: remainFillConfig,
      extraNodeTransformFactories: [
        assignAttrsAtTag('svg', { focusable: 'false' }),
        adjustViewBox,
        setDefaultColorAtPathTag('#333')
      ],
      stringify: twotoneStringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'TwoTone' }),
        content
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'TwoTone' })
    }),

    // 2.4 generate abstract node with the theme "feather"
    generateIcons({
      theme: 'feather',
      from: ['svg/feather/*.svg'],
      toDir: 'src/asn',
      svgoConfig: generalConfig,
      extraNodeTransformFactories: [
        //deleteFeatherAttrsAtTag('svg'),
        assignAttrsAtTag('svg', { focusable: 'false', viewBox: '0 0 16 16' })
      ],
      stringify: JSON.stringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'Feather' }),
        content
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Feather' })
    })
  ),
  parallel(
    // 3.1 generate entry file: src/index.ts
    generateEntry({
      entryName: 'index.ts',
      from: ['src/asn/*.ts'],
      toDir: 'src',
      banner: '// This index.ts file is generated automatically.\n',
      template: `export { default as <%= identifier %> } from '<%= path %>';`,
      mapToInterpolate: ({ name: identifier }) => ({
        identifier,
        path: `./asn/${identifier}`
      })
    }),

    // 3.2 generate inline SVG files
    generateInline({
      from: ['src/asn/*.ts'],
      toDir: ({ _meta }) => `inline-svg/${_meta && _meta.theme}`,
      getIconDefinitionFromSource: (content: string): IconDefinition => {
        const extract = ExtractRegExp.exec(content);
        if (extract === null || !extract[1]) {
          throw new Error('Failed to parse raw icon definition: ' + content);
        }
        return new Function(`return ${extract[1]}`)() as IconDefinition;
      }
    })
    // 3.3 generate inline SVG files with namespace
    // It looks like it generates http://www.w3.org/2000/svg by default now
    //  generateInline({
    //    from: ['src/asn/*.ts'],
    //    toDir: ({ _meta }) => `inline-namespaced-svg/${_meta && _meta.theme}`,
    //    getIconDefinitionFromSource: (content: string): IconDefinition => {
    //      const extract = ExtractRegExp.exec(content);
    //      if (extract === null || !extract[1]) {
    //        throw new Error('Failed to parse raw icon definition: ' + content);
    //      }
    //      return new Function(`return ${extract[1]}`)() as IconDefinition;
    //    },
    //    renderOptions: {
    //      extraSVGAttrs: { xmlns: 'http://www.w3.org/2000/svg' }
    //    }
    //  })
  )
);
