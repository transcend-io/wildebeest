// wildebeest
import { AUTO_MIGRATE, FORCE_UNLOCK } from '@wildebeest/envs';

/**
 * Ensure migration tables are setup and run migrations.
 *
 * @param db - The db instance to migrate
 * @returns The schema written
 */
export default async function runMigrations(db: any): Promise<void> {
  // Ensure the migrations table it setup
  await db.model('migration').setup();

  // Unlock if force is un
  if (FORCE_UNLOCK) {
    await db.model('migrationLock').releaseLock();
  }

  // Run the new migrations if auto migrate is on
  if (AUTO_MIGRATE) {
    await db.model('migrationLock').runWithLock((lock) => lock.migrate());
  }
}
