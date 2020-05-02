import {
  BelongsToAssociation,
  HasManyAssociation,
  HasOneAssociation,
  WildebeestModelName,
} from '@wildebeest/types';

// local
import getKeys from './getKeys';

/**
 * No belongs to many
 */
export type AssociationWithoutBelongsToMany =
  | BelongsToAssociation<WildebeestModelName>
  | HasManyAssociation<WildebeestModelName>
  | HasOneAssociation<WildebeestModelName>;

/**
 * Get the association definitions for a given model name
 *
 * @param modelName - The name of the model to check for
 * @param associations - The association lookup to check for model name in
 * @returns The keys of the object preserving type
 */
export default function getAssociationsByModelName<
  TModelName extends WildebeestModelName
>(
  modelName: TModelName,
  associations: {
    [k in string]: AssociationWithoutBelongsToMany;
  },
): AssociationWithoutBelongsToMany[] {
  return getKeys(associations)
    .filter((associationName) => {
      const association = associations[associationName];
      const associationModelName =
        typeof association === 'object' && association.modelName
          ? association.modelName
          : associationName;
      return associationModelName === modelName;
    })
    .map((associationName) => associations[associationName]);
}
