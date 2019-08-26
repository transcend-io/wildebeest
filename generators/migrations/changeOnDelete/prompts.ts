/**
 *
 * ## ChangeOnDelete Prompts
 * Plop prompt definitions for the change on delete migration.
 *
 * @module changeOnDelete/prompts
 */

// global
import { OnDelete } from '@wildebeest/types';

/**
 * The old onDelete value
 *
 * @returns The prompt
 */
export const oldOnDelete = {
  message: 'What was the old onDelete value?',
  source: () => Object.values(OnDelete),
  type: 'autocomplete',
};

/**
 * What is the new onDelete value?
 *
 * @returns The prompt
 */
export const newOnDelete = {
  message: 'What is the new onDelete value?',
  source: ({ oldOnDelete }) =>
    Object.values(OnDelete).filter((val) => val !== oldOnDelete),
  type: 'autocomplete',
};
