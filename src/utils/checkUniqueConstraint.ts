// external modules
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// wildebeest
import { SequelizeMigrator } from '@wildebeest/types';

/**
 * Check if the database has a unique constraint
 *
 * @param db - The db instance
 * @param tableName - The name of the table
 * @param name - The name of the constraint
 * @returns True if the constraint is defined
 */
export async function hasUniqueConstraint(
  db: SequelizeMigrator,
  tableName: string,
  name: string,
): Promise<boolean> {
  const [constraint] = await db.queryInterface.sequelize.query(
    `
    SELECT constraint_name
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
 * @memberof module:migrations/helpers
 *
 * @param model - The db model to check
 * @param name - The name of the attribute
 * @param definition - The attribute definition
 * @returns True if the unique constraint is set properly
 */
export default async function checkUniqueConstraint(
  db: SequelizeMigrator,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<boolean> {
  // Check if expected to be unique
  const isUnique =
    !!definition.unique && definition.unique && !definition.primaryKey;

  // The name of the constraint
  const uniqueConstraintName = defaultUniqueConstraintName(tableName, name);

  // Check if the constraint exists
  const constraintExists = await hasUniqueConstraint(
    db,
    tableName,
    uniqueConstraintName,
  );

  // Determine if a constraint exists when it should not
  const hasConstraintWhenNot = !isUnique && constraintExists;
  if (hasConstraintWhenNot) {
    logger.error(`Has unexpected constraint: "${uniqueConstraintName}"`);
  }

  // Determine if a constraint does not exist when expected
  const missingConstraintWhenHas = isUnique && !constraintExists;
  if (missingConstraintWhenHas) {
    logger.error(`Missing expected constraint: "${uniqueConstraintName}"`);
  }

  // Return true when setup properly
  return !hasConstraintWhenNot && !missingConstraintWhenHas;
}
