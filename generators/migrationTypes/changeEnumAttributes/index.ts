// local
import { listEnumAttributes } from './lib';
import { SEQUELIZE_ENUM_NAME_REGEX } from './regexs';

// migrationTypes
import { listAllAttributeConfigs } from '../tableColumnMigration/lib';

let columnName;
let useModelPath;

/**
 * A higher order generator that creates a Change enum attributes migrator.
 *
 * Changing attributes of an enum
 *
 */
export default {
  parentType: 'alterEnum',
  prompts: {
    attributes: (repo, { attributesSuggestOnly = false }) => ({
      message: 'Choose another attribute?',
      // Remove auto items when auto change on
      source: ({ enumName, modelPath }) => {
        // The name of the column
        if (!columnName) {
          columnName = enumName.split('_').pop();
        }
        if (!useModelPath) {
          useModelPath = modelPath;
        }

        // Get the attribute config
        const [
          {
            config: { content },
            relativePath,
          },
        ] = listAllAttributeConfigs(repo, useModelPath).filter(
          (attribute) => attribute.columnName === columnName,
        );

        // Determine the name of the enum
        if (!SEQUELIZE_ENUM_NAME_REGEX.test(content)) {
          throw new Error(`Unknown enum definition "${enumName}"`);
        }
        const [, enumInstanceName] = SEQUELIZE_ENUM_NAME_REGEX.exec(content);

        // Extract the export config of the enum
        const enumConfig = repo.getConfigForImport(
          relativePath,
          enumInstanceName,
        );

        // List the enum attributes
        return listEnumAttributes(enumConfig.content);
      },
      itemName: 'name',
      suggestOnly: attributesSuggestOnly,
      type: 'recurseWithoutRepeat',
    }),
  },
};
