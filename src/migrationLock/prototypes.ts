/**
 *
 * ## MigrationLock Prototypes
 * Db model prototypes for the migrationLock model.
 *
 * @module migrationLock/prototypes
 * @see module:migrationLock
 */

// commons
import { ONE_SECOND } from '@commons/constants';
import sleepPromise from '@commons/utils/sleepPromise';

// global
import { verboseLogger } from '@bk/loggers';

// wildebeest
import { LOOKUP_MIGRATIONS } from '@wildebeest/constants';
import { RESTORE_ON_EMPTY } from '@wildebeest/envs';
import clearSchema from '@wildebeest/helpers/clearSchema';
import restoreFromDump from '@wildebeest/helpers/restoreFromDump';

/**
 * Runs migrations down to a number
 *
 * @paramto - The migration to run down to
 * @returns The down to promise
 */
export function downTo(to: number | string): Promise<void> {
  return this.getMigration().down({
    to: LOOKUP_MIGRATIONS[Number(to)].fileName,
  });
}

/**
 * Get the Migration db model class
 *
 * @returns The Migration class definition
 */
export function getMigration(): Promise<void> {
  return this.db.model('migration');
}

/**
 * Load in the latest empty db state
 *
 * @param schema - The schema to restore to
 * @returns The promise that loads in the latest empty db state
 */
export async function latest(schema = RESTORE_ON_EMPTY): Promise<void> {
  // Clear the schema and restore from latest dump
  await clearSchema(this.db.queryInterface);

  // Restore the db to the latest save
  await restoreFromDump(schema);

  // When the restore is not named latest, migrate forward
  if (schema !== 'latest') {
    await this.migrate();
  }
}

/**
 * Migrate the db all the way forward
 *
 * @returns The migration promise
 */
export async function migrate(): Promise<void> {
  // Get the migration class
  const Migration = this.getMigration();

  // Determine the latest migration  run
  const nextMigration = await Migration.latest().then((migration) =>
    migration ? migration.name : undefined,
  );

  try {
    // Migrate from latest
    await Migration.up({ from: nextMigration });
  } catch (err) {
    // Retry the migration when cannot find the migrations folder for some reason... TODO
    if (err.code === 'EIO') {
      verboseLogger.error(`Encountered i/o error: ${err.message}`);
      verboseLogger.info('Retrying migration');
      await this.migrate();
    } else {
      verboseLogger.log(err);
      verboseLogger.log(err.code);
      throw err;
    }
  }
}

/**
 * Run migration tests
 *
 * @returns The test promise
 */
export async function test(): Promise<void> {
  // Wipe first
  await this.wipe();

  // Then all the way forward
  await this.migrate();

  // Sleep for a second
  await sleepPromise(ONE_SECOND * 3);

  // Then down to 2
  await this.downTo(2);

  // Sleep for a second
  await sleepPromise(ONE_SECOND * 3);

  // Then all the way forward
  await this.migrate();
}

/**
 * Runs migrations up to a number
 *
 * @param to - The migration to run up to
 * @returns The up to promise
 */
export function upTo(to: string | number): Promise<void> {
  return this.getMigration().up({ to: LOOKUP_MIGRATIONS[Number(to)].fileName });
}

/**
 * Wipe the db
 *
 * @returns The wipe promise
 */
export async function wipe(): Promise<void> {
  // Get the migration class and db
  const Migration = this.getMigration();
  const { db } = this;

  // Destroy the segment bots if the db is not empty
  await db.model('segmentBot').destroyOnSegment();

  // Run all the way down
  await clearSchema(db.queryInterface);

  // Re-setup
  await Migration.setup();
}
