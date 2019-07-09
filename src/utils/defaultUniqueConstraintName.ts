/**
 * The default unique constraint name
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The default unique constraint name
 */
export default function defaultUniqueConstraintName(
  tableName: string,
  columnName: string,
): string {
  return `${tableName}_${columnName}_key`;
}
