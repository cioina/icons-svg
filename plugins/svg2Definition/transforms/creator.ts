import type { TransformFactory, TransformOptions } from '..';
import {
  clone,
  equals,
  evolve,
  mergeLeft,
  mergeRight,
  omit,
  pipe,
  when,
  where
} from 'ramda';
import type { AbstractNode } from '../../../templates/types';

type Dictionary = Record<string, string>;

export function assignAttrsAtTag(
  tag: string,
  extraPropsOrFn:
    | Dictionary
    | ((
        options: TransformOptions & { previousAttrs: Dictionary }
      ) => Dictionary)
): TransformFactory {
  return (options) => (asn) =>
    when<AbstractNode, AbstractNode>(
      where({
        tag: equals(tag)
      }),
      evolve({
        attrs: pipe<any, Dictionary, Dictionary>(
          clone,
          mergeLeft(
            typeof extraPropsOrFn === 'function'
              ? extraPropsOrFn(
                  mergeRight(options, { previousAttrs: asn.attrs })
                )
              : extraPropsOrFn
          )
        )
      })
    )(asn);
}

export function deleteFeatherAttrsAtTag(tag: string): TransformFactory {
  return () => (asn) =>
    when<AbstractNode, AbstractNode>(
      where({
        tag: equals(tag)
      }),
      evolve({
        attrs: pipe<any, Dictionary, Dictionary>(
          clone,
          omit([
            'width',
            'height',
            'stroke',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-width'
          ])
        )

        //attrs: pipe<any, Dictionary, Dictionary, Dictionary, Dictionary, Dictionary, Dictionary, Dictionary>(
        //   clone,
        //   dissoc('width'),
        //   dissoc('height'),
        //   dissoc('stroke'),
        //   dissoc('stroke-linecap'),
        //   dissoc('stroke-linejoin'),
        //   dissoc('stroke-width')
        // )
      })
    )(asn);
}
