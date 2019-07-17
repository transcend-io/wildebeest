// global
import { QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { ModelMap } from '@wildebeest/types';

/**
 * The configuration for a primary key
 */
export type PrimaryKeyConfig = {
  /** The schema the primary key is defined in */
  table_schema: string;
  /** The name of the table */
  table_name: string;
  /** The name of the primary key column */
  column_name: string;
  /** The name of the index constraint */
  constraint_name: string;
};

/**
 * Get the primary key index configuration for a table
 *
 * @param db - The db instance
 * @param tableName - The name of the table to get the primary key from
 * @returns The primary key configuration
 */
export async function getTablePrimaryKey<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
): Promise<PrimaryKeyConfig> {
  const [primaryKey] = await db.queryInterface.sequelize.query(
    `
    SELECT tc.table_schema, tc.table_name, kc.column_name,tc.constraint_name
    FROM
        information_schema.table_constraints tc,
        information_schema.key_column_usage kc
    WHERE
        tc.constraint_type = 'PRIMARY KEY'
        AND kc.table_name = tc.table_name
        AND kc.table_schema = tc.table_schema
        AND kc.constraint_name = tc.constraint_name
        AND kc.table_name = '${tableName}'
    ORDER by 1, 2;
  `,
    {
      type: QueryTypes.SELECT,
    },
  );

  return primaryKey;
}

/**
 * Ensure that a primary key constraint is setup properly
 *
 * @memberof module:checks
 *
 * @param model - The model to check
 * @param name - The name of the expected primary key
 * @returns True if the primary key config is valid for the specified column
 */
export default async function checkPrimaryKeyDefinition<
  TModels extends ModelMap
>(
  wildebeest: Wildebeest<TModels>,
  tableName: string,
  name: string,
): Promise<boolean> {
  // Get the primary key definition
  const { column_name, constraint_name } = await getTablePrimaryKey(
    wildebeest.db,
    tableName,
  );

  // Ensure the primary key is the same column
  const isSameColumn = name === column_name;
  if (!isSameColumn) {
    wildebeest.logger.error(
      `Wrong column is primary key in "${tableName}" Got "${column_name}", expected "${name}`,
    );
  }

  // Ensure the index has the proper name
  const expectedIndexName = `${tableName}_pkey`;
  const indexNameValid = expectedIndexName === constraint_name;
  if (!indexNameValid) {
    wildebeest.logger.error(
      `Invalid primary index name or table "${tableName}" Got "${constraint_name}", expected "${expectedIndexName}`,
    );
  }

  return isSameColumn && indexNameValid;
} /* eslint-enable camelcase */
