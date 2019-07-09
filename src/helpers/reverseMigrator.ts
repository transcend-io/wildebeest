// wildebeest
import { MigrationDefinition } from '@wildebeest/types';

/**
 * Reverse a higher order generator so down returns up and up returns down
 *
 * @param createMigrator - The higher order migrator to reverse
 * @returns The higher order migrator reversed
 */
export default function reverseMigrator<TOptions>(
  createMigrator: (options: TOptions) => MigrationDefinition,
): (options: TOptions) => MigrationDefinition {
  return (options: TOptions): MigrationDefinition => {
    const { up, down } = createMigrator(options);
    return {
      down: up,
      up: down,
    };
  };
}
