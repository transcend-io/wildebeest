/**
 *
 * ## Wildebeest Constants
 * Constants for wildebeest
 *
 * @module wildebeest/constants
 * @see module:wildebeest
 */

/**
 * The maximum number of migrations to show on a page
 */
export const MAX_MIGRATION_DISPLAY = 30;

/**
 * True if NODE_ENV=test
 */
export const IS_TEST = process.env.NODE_ENV === 'test';

/**
 * One second of time in ms
 */
export const ONE_SECOND = 1000;

/**
 * One minute of time in ms
 */
export const ONE_MINUTE = 60 * ONE_SECOND;

/**
 * The maximum number of times to attempt to acquire the migration lock.
 */
export const MAX_LOCK_ATTEMPTS = 20;

/**
 * The maximum random timeout that should occur between attempts to acquire the migration lock
 */
export const MIGRATION_TIMEOUT = ONE_SECOND * 5;
