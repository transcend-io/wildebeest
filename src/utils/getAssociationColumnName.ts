// global
import { Association, WildebeestModelName } from '@wildebeest/types';

/**
 * Get the name of the column for a belongsTo association
 *
 * @param association - The association config
 * @param name - The name of the association
 * @returns The name of the column
 */
export default function getAssociationColumnName<
  TModelName extends WildebeestModelName
>(association: Association<TModelName>, associationName: string): string {
  // Return name when specified
  if (
    typeof association === 'object' &&
    typeof association.foreignKey === 'string'
  ) {
    return association.foreignKey;
  }
  if (
    typeof association === 'object' &&
    typeof association.foreignKey === 'object' &&
    association.foreignKey.name
  ) {
    return association.foreignKey.name;
  }

  // Return the default
  return `${associationName}Id`;
}
