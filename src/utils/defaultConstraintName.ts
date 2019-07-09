/**
 * The default constraint name
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The default constraint name
 */
export default function defaultConstraintName(
  tableName: string,
  columnName: string,
): string {
  return `${tableName}_${columnName}_fkey`;
}
