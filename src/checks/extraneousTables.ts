// external moduels
import difference from 'lodash/difference';
import { QueryTypes } from 'sequelize';

// global
import { ModelMap, SyncError } from '@wildebeest/types';

// classes
import WildebeestDb from '@wildebeest/classes/WildebeestDb';

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
 * @param wildebeest - The wildebeest db to operate on
 * @param tableNames - The tables names that should exist
 * @returns Any errors related to extra tables.
 */
export default async function checkExtraneousTables<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableNames: string[],
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

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
  if (extraTables.length > 0) {
    extraTables.map((tableName) =>
      errors.push({
        message: `\nExtra table definitions: "${extraTables.join('", "')}"`,
        tableName,
      }),
    );
  }

  return errors;
}
