// external modules
import { execSync } from 'child_process';
import { copyFileSync } from 'fs';
import { join } from 'path';

// wildebeest
import Wildebeest from '@wildebeest';

/**
 * Write the current database schema to a file
 *
 * Only will work when RUN apk add --no-cache postgresql-client=10.5-r0 is not commented out in app.Dockerfile
 *
 * @param wildebeest - The wildebeest db migrator config
 * @param name - The name of the schema file
 * @returns The schema written
 */
export default async function writeSchema(
  { schemaDirectory, databaseUri, logger }: Wildebeest,
  name: string,
): Promise<void> {
  // Hold the output of the sql
  const writePath = join(schemaDirectory, `${name}.dump`);
  await Promise.resolve(execSync(`pg_dump -Fc  ${databaseUri} > ${writePath}`));

  // Copy to src so that it can be synced
  // TODO custom to transcend remove this eventually
  if (writePath.includes('/build/backend/src/')) {
    const srcPath = writePath.replace('/build/backend/src/', '/src/');
    copyFileSync(writePath, srcPath);
  }

  // Log success
  logger.info(`\nWrote schema to dump: "${name}"\n`);
}
