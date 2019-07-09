/**
 *
 * ## Migration Regexs
 * Regular expressions for the migration migration.
 *
 * @module migration/regexs
 * @see module:migration
 */

/**
 * Only log every 10th migration in test mode
 */
export const BASE_100_MIGRATIONS_REGEX = /== ([0-9][0-9]00).+?\(.+?s\)/;
