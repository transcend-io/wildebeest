// mixins
import ChangeCase from '../ChangeCase';
import { SEQUELIZE_MIXINS, WILDEBEEST_MIXINS } from '../constants';
import {
  AssociationInput,
  AssociationMixins,
  AssociationType,
  MixinAttributeInput,
  MixinAttributes,
} from '../types';

/**
 * Get the typescript configuration in the directory
 *
 * @param association - The association definition to calculate the attributes for
 * @param associationType - The type of association to get the attributes for
 * @param additionMixins - Custom mixin attributes to inject
 * @param pluralCase - Optionally provide a custom pluralization function
 * @returns The tsconfig or throws an error
 */
export default function calculateMixinAttributes(
  association: Omit<AssociationInput, 'attributes'>,
  associationType: AssociationType,
  additionMixins: Partial<AssociationMixins> = {},
  pluralCase?: (word: string) => string,
): MixinAttributes[] {
  const attributeInput: MixinAttributeInput = {
    modelName: new ChangeCase(association.modelName, pluralCase),
    associationName: new ChangeCase(association.associationName, pluralCase),
    primaryKeyName: association.primaryKeyName,
    throughModelName: association.throughModelName,
  };

  // Check if there are custom mixins
  const customMixins = additionMixins[associationType];

  // Calculate the mixins to inject
  const sequelizeMixins = SEQUELIZE_MIXINS[associationType](attributeInput);
  const wildebeestMixins = WILDEBEEST_MIXINS[associationType](attributeInput);
  const additionalMixins = customMixins ? customMixins(attributeInput) : [];

  // Merge them all together
  return [...sequelizeMixins, ...wildebeestMixins, ...additionalMixins];
}
