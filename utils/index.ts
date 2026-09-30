import upperFirst from 'lodash.upperfirst';
import camelCase from 'lodash.camelcase';
import type { ThemeTypeUpperCase } from '../templates/types';
import { pipe } from 'ramda';

export interface IdentifierMeta {
  name: string;
  themeSuffix?: ThemeTypeUpperCase;
}

export interface GetIdentifierType {
  (meta: IdentifierMeta): string;
}

export const getIdentifier: GetIdentifierType = pipe(
  ({ name, themeSuffix }: IdentifierMeta) =>
    (/(^\d?)(.*$)/g.exec(name)![1] ? `a${name}` : name) +
    (themeSuffix ? `-${themeSuffix}` : ''),
  camelCase,
  upperFirst
);
