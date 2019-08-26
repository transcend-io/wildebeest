/**
 *
 * ## Change Enum Column Migration Generator
 * Migrate an enum column
 *
 * @module changeEnumColumn
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

export default {
  configure: ({ columnName, modelTableName, modelContainer, model }) => ({
    name: `change-enum-column-${columnName}-${modelTableName}`,
    comment: `Change enum column ${columnName} on table ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Migrate an enum column',
  prompts,
  type: 'tableColumnMigration', // TODO tablesColumnMigration
};
