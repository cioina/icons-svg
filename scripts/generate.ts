import * as allIconDefs from '../src/index';
import type { IconDefinition } from '../src/types';
import { renderIconDefinitionToSVGElement } from '../src/helpers';
import { promises as fsPromises } from 'node:fs';
import { template } from 'lodash';
import * as path from 'node:path';

//This is diffrent than ThemeType from ../templates/types
export type AngularTheme = 'fill' | 'outline' | 'twotone' | 'feather';

interface IconDefinitionWithIdentifier extends IconDefinition {
  svgIdentifier: string;
}

function walk<T>(fn: (iconDef: IconDefinitionWithIdentifier) => Promise<T>) {
  return Promise.all(
    Object.keys(allIconDefs).map((svgIdentifier) => {
      const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
        svgIdentifier
      ];

      return fn({ svgIdentifier, ...iconDef });
    })
  );
}

/**
 * There's a breaking of the underlying dependency but Angular don't have to
 * break too.
 * @param name theme
 */
function adaptTheme(name: string): string {
  return name.replace(/illed$/, 'ill').replace(/utlined$/, 'utline');
}

async function generateIcons() {
  const iconsDir = path.join(__dirname, '../src/icons');
  try {
    await fsPromises.access(iconsDir);
  } catch {
    await fsPromises.mkdir(iconsDir);
  }

  const indexRender = template(`
<%= content %>`);
  const indexContent: string[] = [];

  const manifestRender = template(`
import { Manifest } from './types';

export const manifest: Manifest = {
  fill: [
    <%= fill %>
  ],
  outline: [
    <%= outline %>
  ],
  twotone: [
    <%= twotone %>
  ],
  feather: [
    <%= feather %>
  ]
}`);
  const manifestContent: {
    fill: string[];
    outline: string[];
    twotone: string[];
    feather: string[];
  } = {
    fill: [],
    outline: [],
    twotone: [],
    feather: []
  };

  const staicFileRender = template(
    `
import { IconDefinition } from '@ant-design/icons-angular';

export const <%= svgIdentifier %>: IconDefinition = {
    name: '<%= name %>',
    theme: '<%= theme %>',
    icon: '<%= inlineIcon %>'
}`.trim()
  );

  const svgRender = template(`<%= inlineIcon %>`);

  const jsonpRender = template(
    `
(function() {
  __ant_icon_load({
      name: '<%= name %>',
      theme: '<%= theme %>',
      icon: '<%= inlineIcon %>'
  });
})()
`.trim()
  );

  await walk(async ({ svgIdentifier, name, theme, icon }) => {
    const inlineIcon = renderIconDefinitionToSVGElement({ name, theme, icon });

    svgIdentifier = adaptTheme(svgIdentifier);

    const _theme = adaptTheme(theme) as AngularTheme;

    // Generate static loading resources.
    await fsPromises.writeFile(
      path.resolve(
        __dirname,
        `../src/inline-svg/${_theme}/${svgIdentifier}.ts`
      ),
      staicFileRender({ svgIdentifier, name, theme: _theme, inlineIcon })
    );

    await fsPromises.writeFile(
      path.resolve(__dirname, `../src/inline-svg/${_theme}/${name}.svg`),
      svgRender({ inlineIcon })
    );

    await fsPromises.writeFile(
      path.resolve(__dirname, `../src/inline-svg/${_theme}/${name}.js`),
      jsonpRender({ name, theme: _theme, inlineIcon })
    );

    indexContent.push(
      `export { ${svgIdentifier} } from './${_theme}/${svgIdentifier}';`
    );

    manifestContent[_theme].push(`'${name}'`);
  });

  await fsPromises.writeFile(
    path.resolve(__dirname, `../src/icons/public_api.ts`),
    indexRender({ content: indexContent.join('\n') })
  );

  await fsPromises.writeFile(
    path.resolve(__dirname, `../src/manifest.ts`),
    manifestRender({
      fill: manifestContent.fill.join(', '),
      outline: manifestContent.outline.join(', '),
      twotone: manifestContent.twotone.join(', '),
      feather: manifestContent.feather.join(', ')
    })
  );
}

generateIcons();
