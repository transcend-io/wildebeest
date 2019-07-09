/**
 *
 * ## TableAssociationColumn Lib
 * Helper functions for the table association column migrationType.
 *
 * @module tableAssociationColumn/lib
 * @see module:tableAssociationColumn
 */

// commons
import listAssociations from '@commons/utils/listAssociations';

// utils
import modelPathToAssociationPath from '@generators/utils/modelPathToAssociationPath';

/**
 * Get the associations from a modelPath
 *
 * @param {string}                                modelPath - The path to the model definition index file
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:commons--utils/typeDefs~AssociationConfig[]} The associations
 */
export const getAssociations = function getAssociations(modelPath, repo) {
  const loc = modelPathToAssociationPath(modelPath);
  if (!repo.hasEntryFile(loc)) {
    return [];
  }
  return listAssociations(repo.getEntryFile(loc));
};
