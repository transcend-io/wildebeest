// local
import * as migration from './migration';
import * as migrationLock from './migrationLock';

export { default as MigrationLock } from './migrationLock/MigrationLock';
export { default as Migration } from './migration/Migration';

/**
 * Database models needed to run migrations
 */
const MODELS = {
  migration,
  migrationLock,
};
export default MODELS;
