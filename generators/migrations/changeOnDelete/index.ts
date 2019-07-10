/**
 *
 * ## Change On Delete Migration Generator
 * Change the onDelete status of a foreign key constraint
 *
 * @module changeOnDelete
 * @see module:changeOnDelete/prompts
 */

// external modules
import kebabCase from 'lodash/kebabCase';

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

export default {
  configure: ({
    modelTableName,
    modelContainer,
    model,
    columnName,
    newOnDelete,
    oldOnDelete,
  }) => ({
    name: `change-on-delete-${modelTableName}-${columnName}-to-${kebabCase(
      newOnDelete,
    )}`,
    comment: `Change the foreign key constraint for column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} from ${oldOnDelete} to ${newOnDelete}`,
  }),
  description: 'Change the onDelete status of a foreign key constraint',
  prompts,
  type: 'tableColumnMigration',
};
