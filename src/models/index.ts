/**
 *
 * ## Migration DB Models
 * Database models needed to run migratinos
 *
 * @module wildebeest/models
 */

// local
import * as migration from './migration';
import * as migrationLock from './migrationLock';

export default {
  migrationLock,
  migration,
};
