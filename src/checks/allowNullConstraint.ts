// external
import { ModelAttributeColumnOptions } from 'sequelize';

// global
import { ModelMap, SyncError } from '@wildebeest/types';
import columnAllowsNull from '@wildebeest/utils/columnAllowsNull';

// classes
import WildebeestDb from '@wildebeest/classes/WildebeestDb';

/**
 * Check that the allowNull constraint is setup properly on the column
 *
 * @param name - The name of the attribute
 * @param definition - The attribute definition
 * @returns Any errors with the allow null constraint
 */
export default async function checkAllowNullConstraint<
  TModels extends ModelMap
>(
  db: WildebeestDb<TModels>,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<SyncError[]> {
  // The sync errors found
  const errors: SyncError[] = [];

  // Check if expected to be unique
  const allowsNull = definition.allowNull === true;

  // Check if the column allows null values exists
  const dbAllowsNull = await columnAllowsNull(db, tableName, name);

  // Ensure both align
  if (allowsNull !== dbAllowsNull) {
    errors.push({
      message: dbAllowsNull
        ? `Missing nonNull constraint for column "${name}" in table "${tableName}"`
        : `Extra nonNull constraint for column "${name}" in table "${tableName}"`,
      tableName,
    });
  }

  return errors;
}
