// external modules
import { execSync } from 'child_process';
import { join } from 'path';

// global
import { IS_TEST } from '@bk/constants';
import { logger } from '@bk/loggers';

// db
import { DATABASE_URI } from '@bk/db/envs';

// wildebeest
import { SCHEMA_PATH } from '@wildebeest/constants';

/**
 * Restore the database from a pd_dump output
 *
 * @param name - The name of the schema that was written
 * @param databaseUri - The uri of the database
 * @param path - The path to the restore file
 * @returns The pg_restore promise
 */
export default async function restoreFromDump(
  name: string,
  databaseUri = DATABASE_URI,
  path = SCHEMA_PATH,
): Promise<void> {
  await Promise.resolve(
    execSync(
      `pg_restore -d "${databaseUri}" -n public -C ${join(
        path,
        `${name}.dump`,
      )}`,
    ),
  );
  // Log success
  if (!IS_TEST) {
    logger.success(`\nRestored database schema dump: "${name}"\n`);
  }
}
