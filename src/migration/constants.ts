/**
 *
 * ## Migration Constants
 * Constants for the migration migration.
 *
 * @module migration/constants
 * @see module:migration
 */

// external modules
import { join } from 'path';

/**
 * Skip these strings when logging
 */
export const LOG_SKIPS = [
  'File:  does not match pattern:',
  'File: does not match pattern:',
  'File: index.js does not match pattern:',
];

/**
 * Send the report to the data subject
 */
export const MIGRATIONS_PATH = join(__dirname, '..', 'migrations');
