// external modules
import { QueryTypes } from 'sequelize';

// db
import { Attribute } from '@bk/db/types';

// wildebeest
import logger from '@wildebeest/logger';
import { SequelizeMigrator } from '@wildebeest/types';

// local
import getForeignKeyConfig from './getForeignKeyConfig';

/**
 * Check if the database has a constraint
 *
 * @param db - The db instance
 * @param name - The name of the constraint
 * @returns True if the constraint is defined
 */
export async function hasConstraint(
  db: SequelizeMigrator,
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
 * @memberof module:migrations/helpers
 *
 * @param {string}                        name - The name of the column
 * @param {module:db/typeDefs~Attribute}  definition - The attribute definition
 * @returns True if the association config is proper
 */
export default async function checkAssociationConfig(
  db: SequelizeMigrator,
  tableName: string,
  name: string,
  definition: Attribute,
): Promise<boolean> {
  let valid = true;

  // The name of the constraint
  const constraintName = `${tableName}_${name}_fkey`;

  // Ensure that the constraint exists
  const constraintExists = await hasConstraint(db, constraintName);
  if (!constraintExists) {
    logger.error(
      `Missing foreign key constraint for "${name}" on table "${tableName}": "${constraintName}"`,
    );
  }
  valid = valid && constraintExists;

  if (constraintExists) {
    // Ensure the constraint has proper onDelete
    const { delete_rule } = await getForeignKeyConfig(db, constraintName);
    const expected = definition.associationOptions.onDelete.toUpperCase();
    const onDeleteValid = delete_rule === expected;

    if (!onDeleteValid) {
      logger.error(
        `Invalid foreign key onDelete for column "${name}" of table "${tableName}". Got "${delete_rule}" expected "${expected}"`, // eslint-disable-line max-len
      );
    }

    valid = valid && onDeleteValid;
  }

  return valid;
} /* eslint-enable camelcase */
