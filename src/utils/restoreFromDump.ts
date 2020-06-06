// external
import { execSync } from 'child_process';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ModelMap } from '@wildebeest/types';

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
        wildebeest.db.databaseUri
      }" -n public -C ${wildebeest.getSchemaFile(name)}`,
    ),
  );
  // Log success
  wildebeest.logger.warn(`\nRestored database schema dump: "${name}"\n`);
}
