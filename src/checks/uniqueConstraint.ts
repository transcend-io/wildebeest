// external modules
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { ModelMap, SyncError } from '@wildebeest/types';

/**
 * Check if the database has a unique constraint
 *
 * @param db - The db instance
 * @param tableName - The name of the table
 * @param name - The name of the constraint
 * @returns True if the constraint is defined
 */
export async function hasUniqueConstraint<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  name: string,
): Promise<boolean> {
  const [constraint] = await db.queryInterface.sequelize.query(
    `
    SELECT constraint_name,table_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = '${tableName}'  and "constraint_name" = '${name}'
  `,
    {
      type: QueryTypes.SELECT,
    },
  );
  return !!constraint;
}

/**
 * Ensure a unique constraint is set properly
 *
 * @memberof module:checks
 *
 * @param model - The db model to check
 * @param name - The name of the attribute
 * @param definition - The attribute definition
 * @returns Any errors related to unique constraints
 */
export default async function checkUniqueConstraint<TModels extends ModelMap>(
  { namingConventions, db }: Wildebeest<TModels>,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Check if expected to be unique
  const isUnique = !!definition.unique && !definition.primaryKey;

  // The name of the constraint
  const uniqueConstraintName = namingConventions.uniqueConstraint(
    tableName,
    name,
  );

  // Check if the constraint exists
  const constraintExists = await hasUniqueConstraint(
    db,
    tableName,
    uniqueConstraintName,
  );

  // Determine if a constraint exists when it should not
  if (!isUnique && constraintExists) {
    errors.push({
      message: `Has unexpected constraint: "${uniqueConstraintName}"`,
      tableName,
    });
  }

  // Determine if a constraint does not exist when expected
  if (isUnique && !constraintExists) {
    console.log(definition, name);
    errors.push({
      message: `Missing expected constraint: "${uniqueConstraintName}"`,
      tableName,
    });
  }

  return errors;
}
