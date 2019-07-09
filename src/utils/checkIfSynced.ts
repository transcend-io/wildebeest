// local
import checkAssociationsSync from './checkAssociationsSync';
import checkColumnDefinitions from './checkColumnDefinitions';
import checkIndexes from './checkIndexes';

/**
 * Check that a db model definition in Sequelize is in sync with the actual database definition
 *
 * @memberof module:migrations/helpers
 *
 *
 * @param model - The database model to check
 * @returns True on success TODO should return list of errors
 */
export default async function checkIfSynced(model: Model): Promise<boolean> {
  // Ensure the table exist
  const tableExists = await model.tableExists();
  if (!tableExists) {
    logger.error(`Missing table: ${model.tableName}`);
  }

  // Additional checks
  const [validIndexes, validColumns, validAssociations] = await Promise.all([
    // Check column definitions
    checkColumnDefinitions(model),
    // Ensure the table has the proper multi column indexes
    checkIndexes(model),
    // Ensure the associations are in sync
    checkAssociationsSync(model),
  ]);

  // If true, the model definition is in sync
  return tableExists && validColumns && validIndexes && validAssociations;
}
