/**
 *
 * ## TableColumnMigration Regexs
 * Regular expressions for the table column migration migrationType
 *
 * @module tableColumnMigration/regexs
 * @see module:tableColumnMigration
 */

/**
 * Pull out the name of the extends
 */
export const CLASS_EXTENDS_REGEX = /extends ((?!Model).+?) {/;

/**
 * Determine the location of the class import
 *
 * @param {string}  type - The class type
 * @returns {module:commons--typeDefs~RegEx} The regex
 */
export const CLASS_IMPORT_REGEX = (type) =>
  new RegExp(`const ${type} = require\\('(.+?)'\\);`);

/**
 * Determine the class type
 *
 * @param {string}  exportType - The way the definition is exported
 * @returns {module:commons--typeDefs~RegEx} The regex
 */
export const CLASS_TYPE_REGEX = (exportType) =>
  new RegExp(`${exportType.replace('.', '\\.')}type = '(.+?)';`);
