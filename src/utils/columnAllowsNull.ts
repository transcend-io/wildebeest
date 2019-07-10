// external modules
import { QueryTypes } from 'sequelize';

// wildebeest
import {
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Check if a postgres column allows null values
 *
 * @memberof module:migrations/helpers
 *
 * @param db - The db instance to use
 * @param tableName - The name of the table to check
 * @param columnName - The name of the column
 * @returns True if null values are allowed
 */
export default async function columnAllowsNull(
  db: SequelizeMigrator,
  tableName: string,
  columnName: string,
  transactionOptions?: MigrationTransactionOptions,
): Promise<boolean> {
  const [row] = await db.queryInterface.sequelize.query(
    `
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_name = '${tableName}' AND is_nullable = 'YES' AND column_name = '${columnName}'
  `,
    {
      type: QueryTypes.SELECT,
      ...transactionOptions,
    },
  );
  return !!row;
}
