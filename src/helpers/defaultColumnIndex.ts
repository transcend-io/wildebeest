// db
import { IndexType } from '@bk/db/enums';
import { IndexConfig } from '@bk/db/types';

// local
import defaultColumnIndexName from './defaultColumnIndexName';

/**
 * Generate the default index name for a table/column pair
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The index configuration to use with queryInterface to create the index
 */
export default function defaultColumnIndex(
  tableName: string,
  columnName: string,
): IndexConfig {
  // Determine the default name
  const name = defaultColumnIndexName(tableName, columnName);

  // Determine the configuration
  return columnName === 'id'
    ? { type: IndexType.PrimaryKey, name }
    : { type: IndexType.Unique, name };
}
