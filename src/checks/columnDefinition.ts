// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';
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
 * @param wildebeest - The wildebeest configuration
 * @param model - The model to check
 * @param name - The name of the column to check
 * @returns Any errors related to the column definition
 */
export default async function checkColumnDefinition<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  {
    tableName,
    attributes,
    rawAttributes,
  }: ConfiguredModelDefinition<StringKeys<TModels>>,
  name: string,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Get the column definition
  const definition = attributes[name];
  const rawDefinition = rawAttributes[name];
  if (!definition) {
    errors.push({
      message: `Missing attribute definition for column "${name}" in table "${tableName}"`,
      tableName,
    });
    return errors;
  }

  // Run the column checks
  const allErrors = await Promise.all([
    // If the definition is an enum, verify that the enum configuration is correct
    !isEnum(definition)
      ? []
      : checkEnumDefinition(wildebeest, tableName, name, definition),
    // If the column is a primary key, ensure its constraint exists
    !definition.primaryKey
      ? []
      : checkPrimaryKeyDefinition(wildebeest, tableName, name),
    // Ensure the association is configured properly
    !definition.isAssociation
      ? []
      : checkAssociationConfig(wildebeest, tableName, name, definition),
    // Ensure the unique constraint is set properly
    rawDefinition
      ? checkUniqueConstraint(wildebeest, tableName, name, rawDefinition)
      : [],
    // Ensure allowNull is set properly
    checkAllowNullConstraint(wildebeest.db, tableName, name, definition),
    // Ensure the default value is correct
    checkDefaultValue(wildebeest, tableName, name, definition),
    // Ensure the type is set properly,
    checkColumnType(wildebeest.db, tableName, name, definition),
  ]);

  return errors.concat(...allErrors);
}
