// db
import { Association } from '@wildebeest/types';

/**
 * Get the name of the foreign key if it is provided
 *
 * @memberof module:utils
 *
 * @param association - The association to get the foreign key name from
 * @param defaultValue - When none is provided, fall back to this
 * @returns The name of the foreign key or null if not provided
 */
export default function getForeignKeyName(
  association: Association,
  defaultValue = 'id',
): string {
  if (typeof association === 'string' || !association.foreignKey) {
    return defaultValue;
  }
  if (typeof association.foreignKey === 'string') {
    return association.foreignKey;
  }
  return association.foreignKey.name || defaultValue;
}
