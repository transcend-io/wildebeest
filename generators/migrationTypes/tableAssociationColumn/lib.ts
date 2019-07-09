/**
 *
 * ## TableAssociationColumn Lib
 * Helper functions for the table association column migrationType.
 *
 * @module tableAssociationColumn/lib
 * @see module:tableAssociationColumn
 */

// commons
const listAssociations = require('@commons/utils/listAssociations');

// utils
const modelPathToAssociationPath = require('@generators/utils/modelPathToAssociationPath');

/**
 * Get the associations from a modelPath
 *
 * @param {string}                                modelPath - The path to the model definition index file
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:commons--utils/typeDefs~AssociationConfig[]} The associations
 */
module.exports.getAssociations = function getAssociations(modelPath, repo) {
  const loc = modelPathToAssociationPath(modelPath);
  if (!repo.hasEntryFile(loc)) {
    return [];
  }
  return listAssociations(repo.getEntryFile(loc));
};
