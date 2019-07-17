// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

/**
 * Skip the migrator because it was later removed
 *
 * @memberof module:migrationTypes
 *
 * @returns The skip migrator
 */
export default function skip<TModels extends ModelMap>(): MigrationDefinition<
  TModels
> {
  return {
    up: () => Promise.resolve(null),
    down: () => Promise.resolve(null),
  };
}
