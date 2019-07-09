// local
import { parseNumber } from './getNumberedList';

/**
 * Get the next number from a list of files or folders
 *
 * Default is to check for folders
 *
 * ```typescript
 * // Returns 0003
 * getNextNumber(['0001-my-first.ts', '0002-my-second.ts']);
 * ```
 *
 * @memberof module:utils
 *
 * @param items - The list of numbered items
 * @returns The next number in line as a string
 */
export default function getNextNumber(items: string[]): string {
  return (Math.max(0, ...items.map(parseNumber)) + 1)
    .toString()
    .padStart(4, '0');
}
