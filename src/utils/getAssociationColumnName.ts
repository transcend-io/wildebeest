// global
import { Association } from '@wildebeest/types';

// local
import getAssociationAs from './getAssociationAs';

/**
 * Get the name of the column for a belongsTo association
 *
 * @memberof module:utils
 *
 * @param association - The association config
 * @param name - The name of the association
 * @returns The name of the column
 */
export default function getAssociationColumnName(
  association: Association,
  name: string,
): string {
  // Get the name of model
  const modelName = getAssociationAs(association, name);

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
  return `${modelName}Id`;
}
