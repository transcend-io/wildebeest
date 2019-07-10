// external modules
import { ModelAttributeColumnOptions } from 'sequelize';

// global
import columnAllowsNull from '@wildebeest/utils/columnAllowsNull';
import Wildebeest from '@wildebeest/Wildebeest';

/**
 * Check that the allowNull constraint is setup properly on the column
 *
 * @memberof module:checks
 *
 * @param name - The name of the attribute
 * @param definition - The attribute definition
 * @returns True if the allowNull constraint is set properly
 */
export default async function checkAllowNullConstraint(
  wildebeest: Wildebeest,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<boolean> {
  // Check if expected to be unique
  const allowsNull = definition.allowNull === true;

  // Check if the column allows null values exists
  const dbAllowsNull = await columnAllowsNull(wildebeest.db, tableName, name);

  // Log error if misaligned
  const isInvalid = allowsNull !== dbAllowsNull;
  if (isInvalid) {
    wildebeest.logger.error(
      dbAllowsNull
        ? `Missing nonNull constraint for column "${name}" in table "${tableName}"`
        : `Extra nonNull constraint for column "${name}" in table "${tableName}"`,
    );
  }

  return !isInvalid;
}
