// global
import { ConfiguredModelDefinition, ModelMap } from '@wildebeest/types';
import tableExists from '@wildebeest/utils/tableExists';
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
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The database model definition to verify
 * @param modelName - The name of the model
 * @returns True on success TODO should return list of errorsF
 */
export default async function checkModel<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  model: ConfiguredModelDefinition,
  modelName: string,
): Promise<boolean> {
  // You can skip the check
  if (model.skip) {
    return true;
  }

  // Ensure the table exist
  const exists = await tableExists(wildebeest.db, model.tableName);
  if (!exists) {
    wildebeest.logger.error(`Missing table: ${model.tableName}`);
  }

  // Additional checks
  const [validIndexes, validColumns, validAssociations] = await Promise.all([
    // Check column definitions
    checkColumnDefinitions(wildebeest, model),
    // Ensure the table has the proper multi column indexes
    checkIndexes(wildebeest, model),
    // Ensure the associations are in sync
    checkAssociationsSync(wildebeest, model),
  ]);

  // If true, the model definition is in sync
  return exists && validColumns && validIndexes && validAssociations;
}
