// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

/**
 * Reverse a higher order generator so down returns up and up returns down
 *
 * @param createMigrator - The higher order migrator to reverse
 * @returns The higher order migrator reversed
 */
export default function reverseMigrator<
  TOptions,
  TModels extends ModelMap = ModelMap
>(
  createMigrator: (options: TOptions) => MigrationDefinition<TModels>,
): (options: TOptions) => MigrationDefinition<TModels> {
  return (options: TOptions): MigrationDefinition<TModels> => {
    const { up, down } = createMigrator(options);
    return {
      down: up,
      up: down,
    };
  };
}
