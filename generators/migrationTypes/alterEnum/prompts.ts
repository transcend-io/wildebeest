/**
 *
 * ## AlterEnum Prompts
 * Plop prompt definitions for the alter enum migrationType.
 *
 * @module alterEnum/prompts
 */

// global
import ModelPath from '@generators/prompts/modelPath';

// migrationTypes
import { listAllAttributeConfigs } from '../tableColumnMigration/lib';

/**
 * The name of the enum
 *
 * @param repo - The repository configuration
 * @returns The prompt
 */
export const enumName = (repo) => ({
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
