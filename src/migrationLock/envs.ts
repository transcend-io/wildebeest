/**
 *
 * ## MigrationLock Envs
 * Environment variables for the migration lock migration.
 *
 * @module migrationLock/envs
 * @see module:migrationLock
 */

// commons
import Env from '@commons/classes/Env';
import { ONE_SECOND } from '@commons/constants';

/**
 * The maximum number of times to attempt to acquire the migration lock.
 */
export const MAX_ATTEMPTS = Env.number({
  default: 20,
  name: 'MAX_ATTEMPTS',
});

/**
 * The maximum random timeout that should occur between attempts to acquire the migration lock
 */
export const MIGRATION_TIMEOUT = Env.number({
  default: ONE_SECOND * 5,
  name: 'MIGRATION_TIMEOUT',
});
