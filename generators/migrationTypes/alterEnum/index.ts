// global
import ModelPath from '@generators/prompts/modelPath';

// migrationTypes
import { listAllAttributeConfigs } from '../tableColumnMigration/lib';

/**
 * A higher order generator that creates a Alter enum migrator.
 *
 * Alter an existing enum
 */
export default {
  parentType: 'tableMigration',
  prompts: {
    enumName: (repo) => ({
      message: 'Which enum are you modifying?',
      source: ({ modelPath }) =>
        listAllAttributeConfigs(repo, modelPath)
          .filter(
            ({ config }) => config && config.content.includes('DataTypes.ENUM'),
          )
          .map(
            ({ columnName }) =>
              `enum_${pluralCase(
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
    }),
  },
};
