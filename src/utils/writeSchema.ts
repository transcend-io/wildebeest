// external
import { execSync } from 'child_process';
import { copyFileSync } from 'fs';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ModelMap } from '@wildebeest/types';

/**
 * Write the current database schema to a file
 *
 * Only will work when RUN apk add --no-cache postgresql-client=10.5-r0 is not commented out in app.Dockerfile
 *
 * @param wildebeest - The wildebeest db migrator config
 * @param name - The name of the schema file
 * @returns The schema written
 */
export default async function writeSchema<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  name: string,
): Promise<void> {
  // Hold the output of the sql
  const writePath = wildebeest.getSchemaFile(name);
  await Promise.resolve(
    execSync(`pg_dump -Fc  ${wildebeest.db.databaseUri} > ${writePath}`),
  );

  // Copy to src so that it can be synced
  // TODO custom to transcend remove this eventually
  if (writePath.includes('/build/backend/src/')) {
    const srcPath = writePath.replace('/build/backend/src/', '/src/');
    copyFileSync(writePath, srcPath);
  }

  // Log success
  wildebeest.logger.warn(`\nWrote schema to dump: "${name}"\n`);
}
