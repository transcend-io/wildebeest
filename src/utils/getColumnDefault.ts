// external modules
import { QueryTypes } from 'sequelize';

// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationTransactionOptions, ModelMap } from '@wildebeest/types';

/**
 * Get the default value that the column takes on
 *
 * @memberof module:utils
 *
 * @param db - The db to check
 * @param tableName - The name of the table to check
 * @param columnName - The name of the column
 * @returns The default value
 */
export default async function getColumnDefault<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  columnName: string,
  transactionOptions?: MigrationTransactionOptions<TModels>,
): Promise<string> {
  // Get the default for the column
  const [{ column_default }] = await db.queryInterface.sequelize.query(
    `
    SELECT column_name, column_default
    FROM information_schema.columns
    WHERE (table_schema, table_name, column_name) = ('public', '${tableName}', '${columnName}')
    ORDER BY ordinal_position;
  `,
    {
      ...transactionOptions,
      type: QueryTypes.SELECT,
    },
  );

  return column_default;
}
