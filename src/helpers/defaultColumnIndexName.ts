/**
 * Generate the default index name for a table/column pair
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The expected name of the index
 */
export default function defaultColumnIndexName(
  tableName: string,
  columnName: string,
): string {
  return columnName === 'id'
    ? `${tableName}_pkey`
    : `${tableName}_${columnName}_key`;
}
