// external moduels
import difference from 'lodash/difference';
import { QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/Wildebeest';

/**
 * When querying a table
 */
export type TableDefinition = {
  /** The postgres schema the table belongs to */
  schemaname: string;
  /** The name of the table */
  tablename: string;
};

/**
 * Ensure the default value of a sequelize definition matches the default value in postgres
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest config
 * @param tableNames - The tables names that should exist
 * @returns True if there are no extra tables definitions in the db
 */
export default async function checkExtraneousTables(
  { db, logger }: Wildebeest,
  tableNames: string[],
): Promise<boolean> {
  // Check for existing tables tables
  const tables: TableDefinition[] = await db.query(
    'SELECT schemaname, tablename FROM pg_catalog.pg_tables where "schemaname"=\'public\';',
    { type: QueryTypes.SELECT },
  );

  // Determine if there are any extra
  const extraTables = difference(
    tables.map(({ tablename }) => tablename),
    tableNames,
  );
  const hasExtra = extraTables.length > 0;
  if (hasExtra) {
    logger.error(`\nExtra table definitions: "${extraTables.join('", "')}"`);
  }

  // Determine if the db is out of sync
  return !hasExtra;
}
