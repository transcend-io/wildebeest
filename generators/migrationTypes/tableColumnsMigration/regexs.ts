/**
 *
 * ## TableColumnsMigration Regexs
 * Regular expressions for the table columns migration migrationType
 *
 * @module tableColumnsMigration/regexs
 * @see module:tableColumnsMigration
 */

/**
 * Detect if an attribute definition has a validator
 */
export const ATTRIBUTE_VALIDATOR_REGEX = /validate: ([A-Z_].+?),/;

/**
 * Create an attribute regex
 *
 * @param {string}  name - The name of the attribute
 * @param {string}  exportType - The manner in which the attribute is exported (i.e. export const )
 * @returns {module:commons--typeDefs~RegEx} The regex for matching comment and definition from an attribute
 */
export const ATTRIBUTE_VALUE_REGEX = (name, exportType) =>
  new RegExp(
    `\\/\\*\\*\\n \\* (.+?)\\n \\*[\\s\\S]+${exportType}${name}: ModelAttributeColumnOptions = {([\\s\\S]+?)};`,
  );
