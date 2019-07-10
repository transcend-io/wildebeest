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
 * @param name - The name of the attribute
 * @param exportType - The manner in which the attribute is exported (i.e. export const )
 * @returns The regex for matching comment and definition from an attribute
 */
export const ATTRIBUTE_VALUE_REGEX = (
  name: string,
  exportType: string,
): RegExp =>
  new RegExp(
    `\\/\\*\\*\\n \\* (.+?)\\n \\*[\\s\\S]+${exportType}${name}: ModelAttributeColumnOptions = {([\\s\\S]+?)};`,
  );
