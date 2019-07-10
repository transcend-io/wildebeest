// wildebeest
import { ModelDefinition } from '@wildebeest/types';
import Wildebeest from '@wildebeest';

// local
import checkAssociationsSync from './checkAssociationsSync';
import checkColumnDefinitions from './checkColumnDefinitions';
import checkIndexes from './checkIndexes';
import tableExists from './tableExists';

/**
 * Check that a db model definition in Sequelize is in sync with the actual database definition
 *
 * @memberof module:migrations/helpers
 *
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The database model definition to verify
 * @returns True on success TODO should return list of errorsF
 */
export default async function checkIfSynced(
  wildebeest: Wildebeest,
  model: ModelDefinition,
): Promise<boolean> {
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
