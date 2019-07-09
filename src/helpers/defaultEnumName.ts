/**
 * The default enum name
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The default enum name
 */
export default function defaultEnumName(
  tableName: string,
  columnName: string,
): string {
  return `enum_${tableName}_${columnName}`;
}
