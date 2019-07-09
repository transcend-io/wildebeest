/**
 *
 * ## MigrationLock Model
 * A database model for a MigrationLock request.
 *
 * @module migration/MigrationLock
 * @see module:migration
 */

// external modules
import { Model } from 'sequelize';

// commons
import { ONE_SECOND } from '@commons/constants';
import sleepPromise from '@commons/utils/sleepPromise';

// global
import { ServerError } from '@bk/errors';
import { logger, verboseLogger } from '@bk/loggers';
import { getBackoffTime } from '@bk/utils/exponentialBackoff';

// db
import models from '@bk/db/define';
import { CHECK_SYNC } from '@bk/db/envs';
import { testSetup } from '@bk/db/helpers';

// wildebeest
import { LOOKUP_MIGRATIONS } from '@wildebeest/constants';
import { RESTORE_ON_EMPTY } from '@wildebeest/envs';
import clearSchema from '@wildebeest/utils/clearSchema';
import restoreFromDump from '@wildebeest/utils/restoreFromDump';
import { TransactionOptions } from '@wildebeest/types';

// local
import { EXIT_EVENTS } from './constants';
import { MAX_ATTEMPTS, MIGRATION_TIMEOUT } from './envs';
import { MigrationLockInstance } from './types';

// global

/**
 * A MigrationLock db model
 */
export default class MigrationLock extends Model {
  /**
   * Lock the migrations so no one else attempts to migrate the db at the same time.
   *
   * This function will lookup
   *
   * @returns The locked migration lock instance
   */
  public static async acquireLock(): Promise<MigrationLockInstance> {
    // If there is no lock table yet, return a new empty class
    const lockSetup = await this.isSetup();
    const ThisModel = this;
    if (!lockSetup) {
      return new ThisModel();
    }

    // Release lock if exits prematurely
    let migrationLock;
    const handleExit = async (): Promise<void> => {
      if (migrationLock) {
        migrationLock = null;
        await this.releaseLock();
      }

      process.exit();
    };
    EXIT_EVENTS.forEach((eventType) =>
      process.on(eventType as Parameters<typeof process.on>[0], handleExit),
    );

    // Create a transaction on the find & update
    return this.db.transaction().then(async (transaction) => {
      // Create the update lock
      const lock = {
        transaction,
        lock: transaction.LOCK.UPDATE,
      };

      // Try to acquire the lock
      migrationLock = await this.findOne({
        where: { isLocked: false },
        ...lock,
      });

      // If the lock was acquired, mark it so
      if (migrationLock) {
        await migrationLock.update({ isLocked: true }, lock);
      }

      // Commit the transaction
      await transaction.commit();

      // Return the lock or null if it does not exist
      return migrationLock;
    });
  }

  /**
   * Check if the table is setup and unlocked
   *
   * @returns True if the db has a lock and is migrated
   */
  public static async isOperable(
    transactionOptions?: TransactionOptions,
  ): Promise<boolean> {
    // Check if setup
    const setup = await this.isSetup(transactionOptions);
    if (!setup) {
      return setup;
    }

    // Ensure there is no lock
    return this.count({ where: { isLocked: true } }, transactionOptions).then(
      (cnt) => cnt === 0,
    );
  }

  /**
   * Check if the locks table is setup properly
   *  1) Table exists
   *  2) Only one row
   *
   * @returns True of the table
   */
  public static isSetup(
    transactionOptions?: TransactionOptions,
  ): Promise<boolean> {
    // First ensure the table exists in the db
    return this.getClass()
      .tableExists(transactionOptions)
      .then((exists) =>
        exists
          ? // Ensure only one lock row exists
            this.count({}, transactionOptions).then((count) => count === 1)
          : Promise.resolve(false),
      );
  }

  /**
   * Run a function within the acquired migration lock.
   *
   * Will acquire the lock and wait when the lock is already acquired.
   * Once the lock is acquired, it will run the function provided
   *
   * @param {Function}  cb - The function to run with the acquired lock
   * @returns The amount of time it took to run in ms
   */
  public static async runWithLock(cb): Promise<number> {
    // Timer start
    const start = new Date().getTime();

    // We will repeatedly attempt to acquire the migrationLock.
    // Only one server at a time should be able to run migrations
    let lock;
    let attempts = 0;

    try {
      // Start the server
      while (!lock) {
        /* eslint-disable no-await-in-loop */
        // Only try MAX_ATTEMPTS times
        attempts += 1;
        if (attempts > MAX_ATTEMPTS) {
          throw new ServerError('Unable to acquire migration lock.');
        }

        // Wait a random amount of time with expo backoff
        const sleepTime = getBackoffTime(attempts, MIGRATION_TIMEOUT);
        await sleepPromise(sleepTime);

        // Attempt to acquire the lock
        lock = await this.acquireLock();

        // Log when lock is not acquired
        if (!lock) {
          logger.info(
            `Detected migration occurring, sleeping randomly up to ${sleepTime /
              ONE_SECOND} seconds`,
          );
        }
      } /* eslint-enable */

      verboseLogger.success('~Acquired migration lock~');

      // Run the callback function
      await Promise.resolve(cb(lock));

      // Release the lock
      await this.releaseLock();

      verboseLogger.success('~Released migration lock~');
    } catch (err) {
      // Unlock if error occurred while running
      if (lock) {
        await this.releaseLock();
        lock = null;
      }

      // Still throw the error
      throw err;
    }
    // Timer end
    const end = new Date().getTime();

    // Check that the db is in sync
    if (CHECK_SYNC) {
      await testSetup(this.db, models);
    }

    // The time it took
    return end - start;
  }

  /**
   * Unlock the migration table
   *
   * @returns True on success
   */
  public static async releaseLock(): Promise<boolean> {
    // If there is no lock table yet, return a new empty class
    const lockSetup = await this.isSetup();
    if (!lockSetup) {
      return false;
    }

    // Release the lock
    return this.update({ isLocked: false }, { where: { isLocked: true } }).then(
      ([count]) => count === 1,
    );
  }

  /** Primary key is a UUID with nominal typing */
  public id!: string & {
    /** The name of the db model */
    modelName: 'migrationLock';
  };

  /** Time the API key was created */
  public readonly createdAt!: Date;

  /** Time the API key was updated */
  public readonly updatedAt!: Date;

  /** Whether the table is locked */
  public isLocked!: boolean;

  /**
   * Runs migrations down to a number
   *
   * @paramto - The migration to run down to
   * @returns The down to promise
   */
  public downTo(to: number | string): Promise<void> {
    return this.getMigration().down({
      to: LOOKUP_MIGRATIONS[Number(to)].fileName,
    });
  }

  /**
   * Get the Migration db model class
   *
   * @returns The Migration class definition
   */
  public getMigration(): Promise<void> {
    return this.db.model('migration');
  }

  /**
   * Load in the latest empty db state
   *
   * @param schema - The schema to restore to
   * @returns The promise that loads in the latest empty db state
   */
  public async latest(schema = RESTORE_ON_EMPTY): Promise<void> {
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
  public async migrate(): Promise<void> {
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
  public async test(): Promise<void> {
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
  public upTo(to: string | number): Promise<void> {
    return this.getMigration().up({
      to: LOOKUP_MIGRATIONS[Number(to)].fileName,
    });
  }

  /**
   * Wipe the db
   *
   * @returns The wipe promise
   */
  public async wipe(): Promise<void> {
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
}
