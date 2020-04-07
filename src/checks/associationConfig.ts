// external
import { QueryTypes } from 'sequelize';

// global
import { ConfiguredAttribute, ModelMap, SyncError } from '@wildebeest/types';
import getForeignKeyConfig from '@wildebeest/utils/getForeignKeyConfig';

// local
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';

/**
 * Check if the database has a constraint
 *
 * @param db - The db instance
 * @param name - The name of the constraint
 * @returns True if the constraint is defined
 */
export async function hasConstraint<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  name: string,
): Promise<boolean> {
  const [constraint] = await db.queryInterface.sequelize.query(
    `
    SELECT conname FROM pg_constraint WHERE conname='${name}'
  `,
    {
      type: QueryTypes.SELECT,
    },
  );
  return !!constraint;
}

/**
 * Ensure the constraint between the table column associations is valid
 *
 * @param wilebeest - The wildebeest configuration
 * @param tableName - The name of the table to check
 * @param name - The name of the column
 * @param definition - The attribute definition
 * @returns Any errors with the association configuration
 */
export default async function checkAssociationConfig<TModels extends ModelMap>(
  { namingConventions, db }: Wildebeest<TModels>,
  tableName: string,
  name: string,
  definition: ConfiguredAttribute,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // The name of the constraint
  const constraintName = namingConventions.foreignKeyConstraint(
    tableName,
    name,
  );

  // Ensure that the constraint exists
  const constraintExists = await hasConstraint(db, constraintName);
  if (!constraintExists) {
    errors.push({
      message: `Missing foreign key constraint for "${name}" on table "${tableName}": "${constraintName}"`,
      tableName,
    });
  } else {
    // Ensure the constraint has proper onDelete
    const { delete_rule } = await getForeignKeyConfig(db, constraintName);
    const expected =
      definition.associationOptions && definition.associationOptions.onDelete
        ? definition.associationOptions.onDelete.toUpperCase()
        : 'NO ACTION';

    if (delete_rule !== expected) {
      errors.push({
        message: `Invalid foreign key onDelete for column "${name}" of table "${tableName}". Got "${delete_rule}" expected "${expected}"`, // eslint-disable-line max-len
        tableName,
      });
    }
  }

  return errors;
} /* eslint-enable camelcase */
