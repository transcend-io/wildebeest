// mixins
import {
  AssociationsDefinition,
  AssociationSection,
  GenerateMixinsConfig,
} from '@mixins/types';

// local
import calculateMixinAttributes from './calculateMixinAttributes';
import getKeys from './getKeys';

/**
 * Convert an associations file definition to a list of the association type sections with their accompanied
 *
 * @param associationsDefinition - The section to process
 * @param config - The mixin generation config
 * @returns The association definitions
 */
export default function associationDefinitionToSections(
  { associations }: AssociationsDefinition,
  config: GenerateMixinsConfig,
): AssociationSection[] {
  return (
    getKeys(associations)
      // Remove any associations that are empty objects
      .filter(
        (associationType) =>
          Object.values(associations[associationType]).length > 0,
      )
      // Construct the section config
      .map((associationType) => ({
        associationType,
        // Determine the association definitions
        definitions: getKeys(associations[associationType]).map(
          (associationName) => ({
            associationName,
            ...associations[associationType][associationName],
            // Determine the mixin attributes to inject
            attributes: calculateMixinAttributes(
              {
                associationName,
                ...associations[associationType][associationName],
              },
              associationType,
              config.getCustomMixinAttributes,
              config.pluralCase,
            ),
          }),
        ),
      }))
  );
}
