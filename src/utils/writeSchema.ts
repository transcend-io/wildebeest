// external modules
import { execSync } from 'child_process';
import { copyFileSync } from 'fs';
import { join } from 'path';

// global
import { logger } from '@bk/loggers';

// db
import { DATABASE_URI } from '@bk/db/envs';

// wildebeest
import { SCHEMA_PATH } from '@wildebeest/constants';

/**
 * Write the current database schema to a file
 *
 * Only will work when RUN apk add --no-cache postgresql-client=10.5-r0 is not commented out in app.Dockerfile
 *
 * @param name - The name to reference the saved schema by
 * @param databaseUri - The uri of the database
 * @param path - The folder to store the schema dump file in
 * @returns The schema written
 */
export default async function writeSchema(
  name: string,
  databaseUri = DATABASE_URI,
  path = SCHEMA_PATH,
): Promise<void> {
  // Hold the output of the sql
  const writePath = join(path, `${name}.dump`);
  await Promise.resolve(
    execSync(`pg_dump -Fc  ${databaseUri} > ${join(path, `${name}.dump`)}`),
  );

  // Copy to src so that it can be synced
  if (writePath.includes('/build/backend/src/')) {
    const srcPath = writePath.replace('/build/backend/src/', '/src/');
    copyFileSync(writePath, srcPath);
  }

  logger.success(`\nWrote schema to dump: "${name}"\n`);
}
