// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

/**
 * Skip the migrator because it was later removed
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
