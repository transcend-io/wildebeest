// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ConfiguredModelDefinition, ModelMap } from '@wildebeest/types';
import isEnum from '@wildebeest/utils/isEnum';

// local
import checkAllowNullConstraint from './allowNullConstraint';
import checkAssociationConfig from './associationConfig';
import checkColumnType from './columnType';
import checkDefaultValue from './defaultValue';
import checkEnumDefinition from './enumDefinition';
import checkPrimaryKeyDefinition from './primaryKeyDefinition';
import checkUniqueConstraint from './uniqueConstraint';

/**
 * Check that a db model column definition defined by sequelize is matching the postgres db
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest coniguration
 * @param model - The model to check
 * @param name - The name of the column to check
 * @returns True if the column is setup properly
 */
export default async function checkColumnDefinition<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  { tableName, attributes }: ConfiguredModelDefinition,
  name: string,
): Promise<boolean> {
  // Get the column definition
  const definition = attributes[name];
  if (!definition) {
    wildebeest.logger.error(
      `Missing attribute definition for column "${name}" in table "${tableName}"`,
    );
    return false;
  }

  // Run the column checks
  const columnChecks = await Promise.all([
    // If the definition is an enum, verify that the enum configuration is correct
    !isEnum(definition)
      ? true
      : checkEnumDefinition(wildebeest, tableName, name, definition),
    // If the column is a primary key, ensure its constraint exists
    !definition.primaryKey
      ? true
      : checkPrimaryKeyDefinition(wildebeest, tableName, name),
    // Ensure the association is configured properly
    !definition.isAssociation
      ? true
      : checkAssociationConfig(wildebeest, tableName, name, definition),
    // Ensure the unique constraint is set properly
    checkUniqueConstraint(wildebeest, tableName, name, definition),
    // Ensure allowNull is set properly
    checkAllowNullConstraint(wildebeest, tableName, name, definition),
    // Ensure the default value is correct
    checkDefaultValue(wildebeest, tableName, name, definition),
    // Ensure the type is set properly,
    checkColumnType(wildebeest, tableName, name, definition),
  ]);

  // Returns true if definition is in sync
  return columnChecks.filter((isValid) => !isValid).length === 0;
}
