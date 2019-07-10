// global
import { Association } from '@wildebeest/types';

/**
 * Get the name of an association, uses the as or falls back to default
 *
 * @memberof module:utils
 *
 * @param association - The association configuration to extract the name from
 * @param associationName - The name of the association (key of object)
 * @returns The name of the association
 */
export default function getAssociationAs(
  association: Association,
  associationName: string,
): string {
  if (typeof association === 'string') {
    return associationName;
  }
  if (association.as) {
    return typeof association.as === 'string'
      ? association.as
      : association.as.singular;
  }
  return associationName;
}
