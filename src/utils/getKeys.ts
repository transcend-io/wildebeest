// global
import { StringKeys } from '@wildebeest/types';

/**
 * Object.keys for string keys only
 *
 * @param o - The object to get the keys from
 * @returns The string keys of the object preserving type
 */
export function getStringKeys<T extends { [k in string]: unknown }>(
  o: T,
): StringKeys<T>[] {
  return Object.keys(o).filter((k) => typeof k === 'string') as StringKeys<T>[];
}

/**
 * Object.keys that actually preserves keys as types.
 *
 * @param o - The object to get the keys from
 * @returns The keys of the object preserving type
 */
export default function getKeys<T extends { [k in string]: unknown }>(
  o: T,
): (keyof T)[] {
  return Object.keys(o) as (keyof T)[];
}
