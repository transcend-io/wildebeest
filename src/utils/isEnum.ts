// db
import * as sequelize from 'sequelize';

/**
 * Check if an attribute is an enum
 *
 * @param column - The column definition to check
 * @returns True if the column is an enum definition
 */
export default function isEnum(
  column: sequelize.ModelAttributeColumnOptions,
): boolean {
  return typeof column.type === 'string'
    ? column.type === 'ENUM'
    : column.type.key === 'ENUM';
}
