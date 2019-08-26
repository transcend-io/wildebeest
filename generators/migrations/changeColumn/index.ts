/**
 *
 * ## Change Column Migration Generator
 * Change a column definition
 *
 * @module changeColumn
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

export default {
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
