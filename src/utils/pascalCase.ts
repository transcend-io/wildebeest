// external modules
import cases from 'change-case';

/**
 * Make a word pascal case
 *
 * @param word - The word to modify
 * @returns The word in pascal case
 */
export default function pascalCase(word: string): string {
  return cases.pascalCase(word);
}
