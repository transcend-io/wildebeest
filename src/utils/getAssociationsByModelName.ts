import {
  BelongsToAssociation,
  HasManyAssociation,
  HasOneAssociation,
} from '@wildebeest/types';

// local
import getKeys from './getKeys';

/**
 * No belongs to many
 */
export type AssociationWithoutBelongsToMany<TModelNames extends string> =
  | BelongsToAssociation<TModelNames>
  | HasManyAssociation<TModelNames>
  | HasOneAssociation<TModelNames>;

/**
 * Get the association definitions for a given model name
 *
 * @memberof module:utils
 *
 * @param modelName - The name of the model to check for
 * @param associations - The association lookup to check for model name in
 * @returns The keys of the object preserving type
 */
export default function getAssociationsByModelName<TModelNames extends string>(
  modelName: TModelNames,
  associations: {
    [k in string]: AssociationWithoutBelongsToMany<TModelNames>;
  },
): AssociationWithoutBelongsToMany<TModelNames>[] {
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
