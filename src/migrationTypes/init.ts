// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

// local
import custom from './custom';

/**
 * Options for init migration
 */
export type InitMigrationOptions = {
  /** The genesis migration to begin from TODO this should be optional and a genesis can be created with lock/migration tables */
  genesisSchema: string;
};

/**
 * The initial migration to begin all migrations
 *
 * @param options - Init migration options
 * @returns The init migrator
 */
export default function init<TModels extends ModelMap>({
  genesisSchema,
}: InitMigrationOptions): MigrationDefinition<TModels> {
  return custom({
    up: (_, wildebeest) =>
      wildebeest.runWithLock((lock) => lock.restoreSchema(genesisSchema)),
    down: (_, wildebeest) => wildebeest.runWithLock((lock) => lock.dropAll()),
  });
}
