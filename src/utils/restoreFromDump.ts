// external modules
import { execSync } from 'child_process';

// global
import { IS_TEST } from '@wildebeest/constants';
import { ModelMap } from '@wildebeest/types';
import Wildebeest from '@wildebeest/classes/Wildebeest';

/**
 * Restore the database from a pd_dump output
 *
 * @param wildebeest - The wildebeest instance to restore a dump to
 * @param name - The name of the schema that was written
 * @param schemaPath - The path to the schema folder
 * @returns The pg_restore promise
 */
export default async function restoreFromDump<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  name: string,
): Promise<void> {
  if (!wildebeest.schemaExists(name)) {
    throw new Error(`Schema definition not found: "${name}"`);
  }
  await Promise.resolve(
    execSync(
      `pg_restore -d "${
        wildebeest.databaseUri
      }" -n public -C ${wildebeest.getSchemaFile(name)}`,
    ),
  );
  // Log success
  if (!IS_TEST) {
    wildebeest.logger.info(`\nRestored database schema dump: "${name}"\n`);
  }
}
