// global
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';
import tableExists from '@wildebeest/utils/tableExists';

// classes
import Wildebeest from '@wildebeest/classes/Wildebeest';

// local
import checkAssociationsSync from './associations';
import checkColumnDefinitions from './columnDefinitions';
import checkIndexes from './indexes';

/**
 * Check that a db model definition in Sequelize is in sync with the actual database definition
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The database model definition to verify
 * @param modelName - The name of the model
 * @returns Any errors related to the model definition
 */
export default async function checkModel<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  model: ConfiguredModelDefinition<StringKeys<TModels>>,
  modelName: StringKeys<TModels>,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // You can skip the check
  if (model.skip) {
    return errors;
  }

  // Ensure the table exist
  const exists = await tableExists(wildebeest.db, model.tableName);
  if (!exists) {
    errors.push({
      message: `Missing table: ${model.tableName}`,
      tableName: model.tableName,
    });
  }

  // Additional checks
  const allErrors = await Promise.all([
    // Check column definitions
    checkColumnDefinitions(wildebeest, model),
    // Ensure the table has the proper multi column indexes
    checkIndexes(wildebeest, model),
    // Ensure the associations are in sync
    checkAssociationsSync(wildebeest, model, modelName),
  ]);

  // If true, the model definition is in sync
  return errors.concat(...allErrors);
}
