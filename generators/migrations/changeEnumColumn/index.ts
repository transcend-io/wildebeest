// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Migrate an enum column
 */
export default {
  configure: ({ columnName, modelTableName, modelContainer, model }) => ({
    name: `change-enum-column-${columnName}-${modelTableName}`,
    comment: `Change enum column ${columnName} on table ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Migrate an enum column',
  prompts: {
    oldAttributes: {
      message: 'What are the old enum attributes?',
      extension: 'hbs',
      type: 'editor',
    },
    newAttributes: {
      message: 'What are the new enum attributes?',
      extension: 'hbs',
      type: 'editor',
    },
    oldDefault: {
      message: 'What is the old default value?',
      type: 'input',
    },
    newDefault: {
      message: 'What is the new default value?',
      type: 'input',
    },
  },
  type: 'tableColumnMigration', // TODO tablesColumnMigration
};
