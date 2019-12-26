// external modules
import { QueryTypes } from 'sequelize';

// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationTransactionOptions, ModelMap } from '@wildebeest/types';

/**
 * Check if a postgres column allows null values
 *
 * @param db - The db instance to use
 * @param tableName - The name of the table to check
 * @param columnName - The name of the column
 * @returns True if null values are allowed
 */
export default async function columnAllowsNull<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  columnName: string,
  transactionOptions?: MigrationTransactionOptions<TModels>,
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
