// external modules
import { QueryTypes } from 'sequelize';

// global
import { SequelizeMigrator } from '@wildebeest/types';

/**
 * Check if the model table exists
 *
 * @param db - The db to check against
 * @param tableName - The name of the table to check
 * @returns True if the table exists
 */
export default async function tableExists(
  db: SequelizeMigrator,
  tableName: string,
): Promise<boolean> {
  return db
    .query(
      `SELECT * FROM pg_catalog.pg_tables WHERE tablename='${tableName}' `,
      { type: QueryTypes.SELECT },
    )
    .then((tables) => tables.length === 1);
}
