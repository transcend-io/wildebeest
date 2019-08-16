// external modules
import get from 'lodash/get';

// global
import { AssociationDefinition } from '@mixins/types';

/**
 * Get the value of a string from an object
 */
export function getValueFromObject(
  innerMap: any,
  attributeName: string,
): string | undefined {
  if (!innerMap) {
    return undefined;
  }

  // Get the definition
  const attributeObj = innerMap.get(attributeName);
  if (!attributeObj) {
    return undefined;
  }

  // Determine what the provided modelName is
  const attributeDefinition = get(
    attributeObj,
    'valueDeclaration.initializer.text',
  );
  if (typeof attributeDefinition !== 'string') {
    return undefined;
  }

  return attributeDefinition;
}

/**
 * Process a member of the type definition (known types in the case of associations)
 *
 * @param member - The association type to process (i.e. inner symbol for `belongsTo`)
 * @returns A mapping from association name to model name
 */
export default function serializeAssociationType(
  member: any,
): { [k in string]: AssociationDefinition } {
  // Grab the child types
  const innerMembers = get(member, 'type.members');

  // If there are no members return empty object
  if (!innerMembers) {
    return {};
  }
  const results: { [k in string]: AssociationDefinition } = {};
  innerMembers.forEach(({ type }: any, key: string) => {
    // The inner members of the type if an object
    const innerMap = get(type, 'symbol.members');

    // Determine the name of the primary key column joining the tables
    const foreignKeyMap = get(
      innerMap && innerMap.get('foreignKey'),
      'valueDeclaration.initializer.symbol.members',
    );

    // Defaults to ${modelName}Id
    const primaryKeyName =
      get(
        foreignKeyMap && foreignKeyMap.get('name'),
        'valueDeclaration.initializer.text',
      ) || `${key}Id`;

    // If the association is defined with a string, then the model name is the same as the key
    if (typeof type.value === 'string') {
      results[key] = { modelName: key, primaryKeyName };
    } else {
      const modelName = getValueFromObject(innerMap, 'modelName');
      const throughModelName = getValueFromObject(innerMap, 'throughModelName');
      results[key] =
        typeof modelName === 'string'
          ? { modelName, primaryKeyName, throughModelName }
          : { modelName: key, primaryKeyName, throughModelName };
    }
  });

  return results;
}
