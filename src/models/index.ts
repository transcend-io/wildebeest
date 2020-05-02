// local
import Migration from './migration';
import MigrationLock from './migrationLock';

export { MigrationLock, Migration };

/**
 * Database models needed to run migrations
 */
const MODELS = {
  migration: Migration,
  migrationLock: MigrationLock,
};
export default MODELS;

/**
 * Names of wildebeest db models
 */
export type CustomWildebeestModelName = keyof typeof MODELS;
