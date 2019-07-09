/**
 *
 * ## TableColumnsMigration Lib
 * Helper functions for the table columns migration migrationType.
 *
 * @module tableColumnsMigration/lib
 * @see module:tableColumnsMigration
 */

// commons
const { MODULE_SYSTEM } = require('@commons/enums');

// migrationTypes
const { SEQUELIZE_ENUM_NAME_REGEX } = require('../changeEnumAttributes/regexs');

// local
const {
  ATTRIBUTE_VALUE_REGEX,
  ATTRIBUTE_VALIDATOR_REGEX,
} = require('./regexs');

/**
 * Replace part of the definition using a regex
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @param {string}                                definition - The raw definition
 * @param {string}                                path - The path where the definition is
 * @param {module:commons--typeDefs~RegEx}        regex - The regex to extract with
 * @param {number}                                [index=1] - The index in the regex of the extracted value
 * @returns {string} The definition with replace content
 */
function replaceDefinitionWithRegex(repo, definition, path, regex, index = 1) {
  let useDefinition = definition;

  // Check if the definition matches the regex
  if (regex.test(definition)) {
    // Get the configuration for the item to replace
    const regexMatch = regex.exec(definition);
    const name = regexMatch[index];
    // TODO replace paths
    const enumConfig = repo.getConfigForImport(path, name);

    // Get the replacement definition
    let replaceDefinition = enumConfig.content
      .split('=')
      .pop()
      .trim();
    if (replaceDefinition.endsWith(';')) {
      replaceDefinition = replaceDefinition.slice(
        0,
        replaceDefinition.length - 1,
      );
    }

    // Replace the value in the definition
    useDefinition = definition.replace(name, replaceDefinition);
  }
  return useDefinition;
}

/**
 * Get the definition of an attribute from its file
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @param {string}                                path - The path to the attributes file
 * @param {string}                                columnName - The name of the attribute
 * @returns {string[]} The comment and definition
 */
module.exports.getAttributeFileDefinition = function getAttributeFileDefinition(
  repo,
  path,
  columnName,
) {
  // Read in the attributes
  const content = repo.readEntryFile(path);
  const [attr] = repo
    .listEntryExportsConfig(path)
    .filter(({ name }) => name === columnName);

  // Build a regex to pull out the attribute definition
  const regex = ATTRIBUTE_VALUE_REGEX(
    columnName,
    repo.moduleSystem === MODULE_SYSTEM.commonjs
      ? 'module.exports.'
      : 'export const ',
  );

  // Pull out the part of the file related to the attribute
  const useContent = attr
    ? content
        .split('\n')
        .slice(attr.startLine, content.length)
        .join('\n')
    : content;

  // Pull out the comment and definition
  let [, comment, definition] = regex.exec(useContent); // eslint-disable-line prefer-const

  // Check for and import enum definition if exists
  definition = replaceDefinitionWithRegex(
    repo,
    definition,
    path,
    SEQUELIZE_ENUM_NAME_REGEX,
  );

  // Check for and import validator definition if exists
  definition = replaceDefinitionWithRegex(
    repo,
    definition,
    path,
    ATTRIBUTE_VALIDATOR_REGEX,
  );
  return [comment, definition.trim()];
};
