// global
import { logger } from '@bk/loggers';

// db
import Model from '@bk/db/ModelManager';

// local
import checkAllowNullConstraint from './checkAllowNullConstraint';
import checkAssociationConfig from './checkAssociationConfig';
import checkColumnType from './checkColumnType';
import checkDefaultValue from './checkDefaultValue';
import checkEnumDefinition from './checkEnumDefinition';
import checkPrimaryKeyDefinition from './checkPrimaryKeyDefinition';
import checkUniqueConstraint from './checkUniqueConstraint';
import isEnum from './isEnum';

/**
 * Check that a db model column definition defined by sequelize is matching the postgres db
 *
 * @memberof module:migrations/helpers
 *
 * @param model - The model to check
 * @param name - The name of the column to check
 * @returns True if the column is setup properly
 */
export default async function checkColumnDefinition(
  model: Model,
  name: string,
): Promise<boolean> {
  // Get the column definition
  const definition = model.modelAttributes[name];
  if (!definition) {
    logger.error(
      `Missing attribute definition for column "${name}" in table "${model.tableName}"`,
    );
    return false;
  }

  // Run the column checks
  const columnChecks = await Promise.all([
    // If the definition is an enum, verify that the enum configuration is correct
    !isEnum(definition) ? true : checkEnumDefinition(model, name, definition),
    // If the column is a primary key, ensure its constraint exists
    !definition.primaryKey ? true : checkPrimaryKeyDefinition(model, name),
    // Ensure the association is configured properly
    !definition.isAssociation
      ? true
      : checkAssociationConfig(model, name, definition),
    // Ensure the unique constraint is set properly
    checkUniqueConstraint(model, name, definition),
    // Ensure allowNull is set properly
    checkAllowNullConstraint(model, name, definition),
    // Ensure the default value is correct
    checkDefaultValue(model, name, definition),
    // Ensure the type is set properly,
    checkColumnType(model, name, definition),
  ]);

  // Returns true if definition is in sync
  return columnChecks.filter((isValid) => !isValid).length === 0;
}
