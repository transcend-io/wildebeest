// global
import { MigrationDefinition } from '@wildebeest/types';

/**
 * Skip the migrator because it was later removed
 *
 * @memberof module:migrationTypes
 *
 * @returns The skip migrator
 */
export default function skip(): MigrationDefinition {
  return {
    up: () => Promise.resolve(null),
    down: () => Promise.resolve(null),
  };
}
