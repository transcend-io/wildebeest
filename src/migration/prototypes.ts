/**
 *
 * ## Migration Prototypes
 * Db model prototypes for the migration model.
 *
 * @module migration/prototypes
 * @see module:migration
 */

/**
 * The name of the migration file
 *
 * @returns The name of the migration file
 */
export function fileName(): string {
  return `${this.name}.js`;
}
/**
 * The migrations number
 *
 * @returns The number of the migration file
 */
export function num(): string {
  return this.name.substring(0, 4);
}
