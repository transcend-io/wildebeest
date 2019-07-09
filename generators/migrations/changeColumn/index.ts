/**
 *
 * ## Change Column Migration Generator
 * Change a column definition
 *
 * @module changeColumn
 * @see module:changeColumn/prompts
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import prompts from './prompts';

module.exports = {
  configure: ({
    columnName,
    // tables,
    modelContainer,
    model,
  }) => ({
    name: `change-column-${columnName}`,
    comment: `Change column "${columnName}" on table ${linkToClass(
      modelContainer,
      model,
    )}`,
    // comment: `Change column ${columnName} on tables ${tables.map(({ modelContainer, model }) => linkToClass(modelContainer, model)).join(', ')}`, // eslint-disable-line max-len
  }),
  description: 'Change a column definition',
  prompts,
  type: 'tableColumnMigration', // TODO 'tablesColumnMigration',
};
