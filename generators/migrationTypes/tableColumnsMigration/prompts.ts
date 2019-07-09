/**
 *
 * ## TableColumnsMigration Prompts
 * Prompts for the table columns migration migrationType.
 *
 * @module tableColumnsMigration/prompts
 * @see module:tableColumnsMigration
 */

// migrationTypes
const {
  listAllAttributeConfigs,
  listAllAttributes,
} = require('../tableColumnMigration/lib');

// local
const { getAttributeFileDefinition } = require('./lib');

let useData;
let attributeConfigs;

/**
 * Determine the function for get row defaults
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @param {module:typeDefs~Options}               options - The configuration options
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.getRowDefaults = (repo, { withGetRowDefaults }) =>
  withGetRowDefaults && {
    message:
      'Provider a mapping from oldRowInstance => newColumnDefaults (leaving blank to skip)',
    extension: 'hbs',
    type: 'editor',
  };

/**
 * Recurse is message up and so in order to have method before columnName, this needs to exist
 */
module.exports.method = false;

/**
 * The columns to modify
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @param {module:typeDefs~Options}               options - The configuration options
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.columns = (repo, options) => ({
  itemName: 'columnName',
  message: `Choose another column?${
    options.suggestOnly || options.columnSuggestOnly ? ' (suggestOnly)' : ''
  }`,
  // Remove auto items when auto change on
  source: (data) => {
    if (!useData) {
      useData = data;
    }
    if (!attributeConfigs) {
      attributeConfigs = listAllAttributeConfigs(repo, useData.modelPath);
    }
    return listAllAttributes(repo, useData.modelPath);
  },
  // Optionally comment/define each column
  prompts: options.skipColumnPrompts
    ? {}
    : {
        _config: {
          exec: (data) => {
            // Get the config for the selected attribute
            const [thisConfig] = attributeConfigs.filter(
              ({ columnName }) => columnName === data.columnName,
            );

            // SuggestOnly
            if (
              (options.suggestOnly || options.columnSuggestOnly) &&
              !thisConfig
            ) {
              return;
            }

            // Determine if association  column and pull out the config
            const isAssociation = thisConfig.type === 'association';
            const association = isAssociation ? thisConfig.association : null;

            // Save whether an association
            Object.assign(data, {
              isAssociation,
              allowNull:
                association &&
                !!association.options &&
                !association.options.includes('...NON_NULL'),
            });

            // If association has a different modelName
            if (association && association.modelName !== association.name) {
              Object.assign(data, {
                tableName: association.tableName,
              });
            }

            // Determine the comment and definition
            let comment;
            let definition;

            if (thisConfig.type === 'association') {
              comment = `The id to the ${data.columnName.slice(
                0,
                data.columnName.length - 2,
              )}`;
              definition = `allowNull: ${data.allowNull.toString()},
defaultValue: DataTypes.UUIDV4,
type: DataTypes.UUID,`;
            } else {
              [comment, definition] = getAttributeFileDefinition(
                repo,
                thisConfig.relativePath,
                data.columnName,
              );
            }

            // Set definition and column
            Object.assign(data, { comment, definition });
          },
          type: 'skip',
        },
        comment: {
          when: ({ comment }) => !comment,
          default: ({ columnName }) =>
            columnName.endsWith('Id')
              ? `The reference to the associated ${columnName.slice(
                  0,
                  columnName.length - 2,
                )}`
              : null,
          message: 'Comment the column',
          type: 'comment',
        },
        isAssociation: {
          when: ({ definition, isAssociation }) =>
            !definition && !isAssociation,
          default: ({ columnName }) => columnName.endsWith('Id'),
          message: 'Is the column an association?',
          type: 'confirm',
        },
        definition: {
          when: ({ definition }) => !definition,
          default: ({ columnName }) =>
            columnName.endsWith('Id')
              ? `allowNull: false,
defaultValue: DataTypes.UUIDV4,
type: DataTypes.UUID,`
              : '',
          extension: 'hbs',
          message: 'What is a the column definition?',
          type: 'editor',
        },
      },
  postProcess: ({ columns }) => ({
    constraints: columns.filter((col) => col.isAssociation),
  }),
  suggestOnly: options.suggestOnly || options.columnSuggestOnly,
  type: 'recurseWithoutRepeat',
});
