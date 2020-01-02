// commons
import cases from '@commons/cases';

// global
import migrationTypes from '@generators/migrationTypes';

const DEFAULT_TEMPLATE = (generatorName) => `{{> dbMigrationHeader }}
// migrationTypes
import ${generatorName} from '@bk/migrations/migrationTypes/${generatorName}';${'\n'}
${`${'module.'}${'exports'}`} = ${generatorName}({
  TODO
});
`;

/**
 * Create a new migration type
 *
 * TODO wildebeest
 */
export default {
  description: 'Create a new migration type',
  location: 'migrations',
  prompts: {
    generatorType: {
      source: () => ['', ...Object.keys(migrationTypes)],
      message: 'What type of migration?',
      type: 'autocomplete',
    },
    templateContents: {
      default: ({ container }) => DEFAULT_TEMPLATE(container),
      message: 'What is the migration template?',
      extension: 'hbs',
      type: 'editor',
    },
    nameExt: {
      message: ({ container }) =>
        `What should be appended to "${cases.paramCase(
          container,
        )}" to create the name of the migration?`,
      type: 'input',
      required: true,
    },
    defaultComment: {
      message: 'What should be the default comment for the migration?',
      type: 'input',
      required: true,
    },
  },
  requiredFiles: [
    {
      generator: 'handlebars-template',
      config: () => ({ name: 'template', extension: 'hbs' }),
    },
  ],
  skipActions: true,
  type: 'generatorContainer',
};
