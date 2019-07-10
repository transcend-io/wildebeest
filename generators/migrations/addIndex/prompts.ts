/**
 *
 * ## AddIndex Prompts
 * Plop prompt definitions for the add index migration.
 *
 * @module addIndex/prompts
 * @see module:addIndex
 */

// commons
import { IndexMethod } from '@wildebeest/types';

/**
 * The index method
 *
 * @returns The prompt
 */
export const method = {
  default: IndexMethod.BTree,
  message: 'What method of index?',
  source: () => Object.values(IndexMethod),
  type: 'autocomplete',
};
