// commons
import listAssociations from '@commons/utils/listAssociations';

// utils
import modelPathToAssociationPath from '@generators/utils/modelPathToAssociationPath';

/**
 * Get the associations from a modelPath
 *
 * @param modelPath - The path to the model definition index file
 * @param repo - The repository configuration
 * @returns The associations
 */
export const getAssociations = function getAssociations(
  modelPath,
  repo,
): AssociationConfig[] {
  const loc = modelPathToAssociationPath(modelPath);
  if (!repo.hasEntryFile(loc)) {
    return [];
  }
  return listAssociations(repo.getEntryFile(loc));
};
