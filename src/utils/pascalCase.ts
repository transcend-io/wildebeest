// external modules
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

/**
 * Make a word pascal case
 *
 * @param word - The word to modify
 * @returns The word in pascal case
 */
export default function pascalCase(word: string): string {
  return upperFirst(camelCase(word));
}
