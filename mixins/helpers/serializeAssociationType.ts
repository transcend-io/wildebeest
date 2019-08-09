// external modules
import get from 'lodash/get';

/**
 * Callback when failed to properly serialize association
 *
 * @param key - The association key that failed
 * @param fileName - The file where the extraction failed
 */
function failedToSerialize(key: string, fileName: string): void {
  /* eslint-disable no-console */
  console.log(
    `Failed to verify modelName for "${key}" in "${fileName}", falling back to "${key}"`,
  );
  console.log('Ensure you are not casting the type of the association');
  /* eslint-enable no-console */
}

/**
 * Process a member of the type definition (known types in the case of associations)
 *
 * @param member - The association type to process (i.e. inner symbol for `belongsTo`)
 * @param originalFileName - The file name checked
 * @returns A mapping from association name to model name
 */
export default function serializeAssociationType(
  member: any,
  originalFileName: string,
): { [k in string]: string } {
  // Grab the child types
  const innerMembers = get(member, 'type.members');

  // If there are no members return empty object
  if (!innerMembers) {
    return {};
  }
  const results: { [k in string]: string } = {};
  innerMembers.forEach(({ type }: any, key: string) => {
    // The inner members of the type if an object
    const getInnerMap = get(type, 'symbol.members');

    // If the association is defined with a string, then the model name is the same as the key
    if (typeof type.value === 'string') {
      results[key] = key;
    } else if (getInnerMap && !getInnerMap.get('modelName')) {
      // If an object but no modelName, then also the key
      results[key] = key;
    } else if (getInnerMap && getInnerMap.get('modelName')) {
      // Determine what the provided modelName is
      const modelNameSymbol = getInnerMap.get('modelName');
      const modelName = get(
        modelNameSymbol,
        'valueDeclaration.initializer.text',
      );

      // If fetched properly, assign
      if (typeof modelName === 'string') {
        results[key] = modelName;
      } else {
        failedToSerialize(key, originalFileName);
        results[key] = key;
      }
    } else {
      failedToSerialize(key, originalFileName);
      results[key] = key;
    }
  });

  return results;
}
