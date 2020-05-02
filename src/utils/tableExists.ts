// external
import { WildebeestDb } from '@wildebeest/classes';
import { QueryTypes, Transaction } from 'sequelize';

/**
 * Check if the model table exists
 *
 * @param db - The db to check against
 * @param tableName - The name of the table to check
 * @param transaction - The current transaction
 * @returns True if the table exists
 */
export default async function tableExists(
  db: WildebeestDb,
  tableName: string,
  transaction?: Transaction,
): Promise<boolean> {
  return db
    .query(
      `SELECT * FROM pg_catalog.pg_tables WHERE tablename='${tableName}' `,
      { type: QueryTypes.SELECT, transaction },
    )
    .then((tables) => tables.length === 1);
}
