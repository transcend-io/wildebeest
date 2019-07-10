/**
 *
 * ## TableColumnMigration Lib
 * Helper functions for the table column migration migrationType.
 *
 * @module tableColumnMigration/lib
 * @see module:tableColumnMigration
 */

// external modules
import flatten from 'lodash/flatten';

// migrationTypes
import { getAssociations } from '../tableAssociationColumn/lib';

// local
const {
  CLASS_IMPORT_REGEX,
  CLASS_EXTENDS_REGEX,
  CLASS_TYPE_REGEX,
} = require('./regexs');

/**
 * Get the parent directory from modelPath
 *
 * @param modelPath - The relative path to the table model
 * @returns The relative path to the model parent directory
 */
function getParentDir(modelPath: string): string {
  const split = modelPath.split('/');
  const parentLoc = split.slice(0, split.length - 2).join('/');
  return parentLoc;
}

/**
 * Get attributes file from index file
 *
 * @param repo - The repository configuration
 * @param indexPath - The relative path to an index file
 * @returns The relative path to the attributes file
 */
function getAttributeFiles(repo, indexPath: string): string {
  // Attributes for model
  return repo.join(
    indexPath.replace('/index', '').replace('/Model', ''),
    'attributes',
  );
}

/**
 * Get the relative path to the class type definition that the model inherits from
 *
 * @param repo - The repository configuration
 * @param modelPath - The relative path to the table model
 * @returns The relative path to the class type definition folder
 */
function getClassTypeDir(repo, modelPath: string): string {
  // Build a regex to find the class type
  const typeRegex = CLASS_TYPE_REGEX(
    repo.moduleSystem === MODULE_SYSTEM.commonjs
      ? 'export const '
      : 'export const ',
  );
  const contents = repo.readEntryFile(modelPath);

  // If the class type is not found return
  const classType = typeRegex.test(contents)
    ? typeRegex.exec(contents)[1]
    : null;
  if (!classType) {
    return null;
  }

  // The path to the class index file
  const classFolder = repo.join(getParentDir(modelPath), 'classes');
  const classIndexFile = repo.join(classFolder, 'index');
  if (!repo.hasEntryFile(classIndexFile)) {
    return null;
  }

  // Read in the class contents and determine the location of the class type file
  const classIndexContents = repo.readEntryFile(classIndexFile);
  const classLocationRegex = CLASS_IMPORT_REGEX(classType);
  if (!classLocationRegex.test(classIndexContents)) {
    return null;
  }

  // Determine the path to the class folder definition
  const classLocation = classLocationRegex.exec(classIndexContents)[1];
  return repo.join(classFolder, classLocation.replace('./', ''), 'index');
}

/**
 * Get the relative path to all folders that the class extends
 *
 * @param repo - The repository configuration
 * @param classPath - The relative path to the class model
 * @returns The relative path to the class definitions that the model extends from
 */
function getAllExtends(repo, classPath: string): string[] {
  // The folders that the class extends from
  const extendClasses = [];
  let currentPath = classPath;
  let contents = repo.readEntryFile(currentPath);
  while (CLASS_EXTENDS_REGEX.test(contents)) {
    // Save the class path
    extendClasses.push(currentPath);

    // The name of the class being extended
    const [, className] = CLASS_EXTENDS_REGEX.exec(contents);

    // Determine location of the next class
    const importRegex = CLASS_IMPORT_REGEX(className);
    const [, nextLocation] = importRegex.exec(contents);
    currentPath = repo.join(
      currentPath.replace('/index', ''),
      nextLocation,
      'index',
    );
    contents = repo.readEntryFile(currentPath);
  }

  return extendClasses;
}

/**
 * List all attributes for a model with the path and type
 *
 * @param repo - The repository configuration
 * @param modelPath - The relative path to the table model
 * @returns The attributes that the model supports
 */
export const listAllAttributeConfigs = function listAllAttributeConfigs(
  repo,
  modelPath: string,
): AttributeDefinition[] {
  // Check if the modelPath inherits from a class
  const classPath = getClassTypeDir(repo, modelPath);

  // The files where associations may be defined
  const associationFiles = [
    // The model definition itself
    modelPath,
    // The ../Model file
    repo.join(getParentDir(modelPath), 'Model'),
    // All classes that it extends from
    ...(classPath ? getAllExtends(repo, classPath) : []),
  ];

  // The associations attributes files
  const attributesFiles = associationFiles
    .map((path) => getAttributeFiles(repo, path))
    .filter((x) => repo.hasEntryFile(x));

  // The columns that the model has
  return flatten([
    // The attributes
    ...attributesFiles.map((relativePath) =>
      repo.listEntryExportsConfig(relativePath).map((config) => ({
        relativePath,
        type: 'attribute',
        columnName: config.name,
        config,
      })),
    ),
    // The associations
    ...associationFiles
      .filter((relativePath) => repo.hasEntryFile(relativePath))
      .map((relativePath) =>
        getAssociations(relativePath, repo)
          .filter(({ associationType }) => associationType === 'belongsTo')
          .map((association) => ({
            association,
            columnName: `${association.name}Id`,
            type: 'association',
            relativePath,
          })),
      ),
  ]);
};

/**
 * List all attributes for a model
 *
 * @param repo - The repository configuration
 * @param modelPath - The relative path to the table model
 * @returns The attributes that the model supports
 */
export const listAllAttributes = function listAllAttributes(
  repo,
  modelPath: string,
): string[] {
  return module.exports
    .listAllAttributeConfigs(repo, modelPath)
    .map(({ columnName }) => columnName);
};
