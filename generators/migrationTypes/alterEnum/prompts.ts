/**
 *
 * ## AlterEnum Prompts
 * Plop prompt definitions for the alter enum migrationType.
 *
 * @module alterEnum/prompts
 * @see module:alterEnum
 */

// commons
const cases = require('@commons/cases');

// global
const ModelPath = require('@generators/prompts/modelPath');

// migrationTypes
const { listAllAttributeConfigs } = require('../tableColumnMigration/lib');

/**
 * The name of the enum
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.enumName = (repo) => ({
  message: 'Which enum are you modifying?',
  source: ({ modelPath }) =>
    listAllAttributeConfigs(repo, modelPath)
      .filter(
        ({ config }) => config && config.content.includes('DataTypes.ENUM'),
      )
      .map(
        ({ columnName }) =>
          `enum_${cases.pluralCase(
            ModelPath.getModelName(repo, modelPath),
          )}_${columnName}`,
      ),
  type: 'autocomplete',
  postProcess: ({ enumName }) => {
    const split = enumName.split('_');
    // TODO
    const columnName = split.pop();
    const tableName = split.slice(1, split.length).join('_');
    return {
      columnName,
      tableName,
    };
  },
});
