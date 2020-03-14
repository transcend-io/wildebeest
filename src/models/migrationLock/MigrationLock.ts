/**
 * A database model for a MigrationLock request.
 */

// external modules
import { Transaction } from 'sequelize';

// global
import WildebeestModel from '@wildebeest/classes/WildebeestModel';
import { EXIT_EVENTS, ONE_SECOND } from '@wildebeest/constants';
import clearSchema from '@wildebeest/utils/clearSchema';
import restoreFromDump from '@wildebeest/utils/restoreFromDump';
import sleepPromise from '@wildebeest/utils/sleepPromise';
import tableExists from '@wildebeest/utils/tableExists';

// models
import Migration from '@wildebeest/models/migration/Migration';
import { ExtractAttributes, ModelMap } from '@wildebeest/types';

// local
import attributes from './attributes';

/**
 * A MigrationLock db model
 */
export default class MigrationLock<TModels extends ModelMap>
  extends WildebeestModel<TModels>
  implements ExtractAttributes<typeof attributes> {
  /** The model definition */
  public static definition = {
    attributes,
    tableName: 'migrationLocks',
  };

  /**
   * Lock the migrations so no one else attempts to migrate the db at the same time.
   *
   * This function will lookup
   *
   * @returns The locked migration lock instance
   */
  public static async acquireLock(): Promise<MigrationLock<ModelMap> | null> {
    // If there is no lock table yet, return a new empty class
    const lockSetup = await this.isSetup();
    const ThisModel = this as any;
    if (!lockSetup) {
      return new ThisModel();
    }

    // Release lock if exits prematurely
    let migrationLock: MigrationLock<ModelMap> | null;
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

    const { sequelize } = this;
    if (!sequelize) {
      throw new Error('No sequelize!');
    }

    // Create a transaction on the find & update
    return sequelize.transaction().then(async (transaction) => {
      // Create the update lock
      const lock = {
        transaction,
        lock: (transaction as any).LOCK.UPDATE,
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
   * @param transaction - The current transaction
   * @returns True if the db has a lock and is migrated
   */
  public static async isOperable(transaction?: Transaction): Promise<boolean> {
    // Check if setup
    const setup = await this.isSetup(transaction);
    if (!setup) {
      return setup;
    }

    // Ensure there is no lock
    return this.count({ where: { isLocked: true }, transaction }).then(
      (cnt) => cnt === 0,
    );
  }

  /**
   * Check if the locks table is setup properly
   *  1) Table exists
   *  2) Only one row
   *
   * @param transaction - The current transaction
   * @returns True of the table
   */
  public static isSetup(transaction?: Transaction): Promise<boolean> {
    // Ensure init
    if (!this.db) {
      throw new Error('Model must be initialize before setup can be checked');
    }

    // First ensure the table exists in the db
    return tableExists(this.db, this.tableName, transaction).then((exists) =>
      exists
        ? // Ensure only one lock row exists
          this.count({ transaction }).then((count) => count === 1)
        : Promise.resolve(false),
    );
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

  /** Whether the table is locked */
  public isLocked!: boolean;

  /**
   * Runs migrations down to a number
   *
   * @param to - The migration to run down to
   * @returns The down to promise
   */
  public downTo(to: number | string): Promise<void> {
    return Migration.down({
      to: this.wildebeest.lookupMigration[Number(to)].fileName,
    });
  }

  /**
   * Clear the db removing all tables
   *
   * @param to - The migration to run down to
   * @returns The clear promise
   */
  public dropAll(): Promise<void> {
    return clearSchema(this.db.queryInterface);
  }

  /**
   * Restore the database from a schema checkpoint
   *
   * @param schema - the name of the schema
   * @returns The promise that loads in the db from that state
   */
  public async restoreSchema(schema: string): Promise<void> {
    // Clear the schema and restore from latest dump
    await this.dropAll();

    // Restore the db to the latest save
    await restoreFromDump(this.wildebeest, schema);
  }

  /**
   * Load in the latest empty db state
   *
   * @param schema - The schema to restore to
   * @returns The promise that loads in the latest empty db state
   */
  public async latest(
    schema = this.wildebeest.restoreSchemaOnEmpty,
  ): Promise<void> {
    // Restore the db to the latest save
    await this.restoreSchema(schema);

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
    // Determine the latest migration  run
    const nextMigration = await Migration.latest().then((migration) =>
      migration ? migration.name : undefined,
    );

    try {
      // Migrate from latest
      await Migration.up({ from: nextMigration });
    } catch (err) {
      // Retry the migration when cannot find the migrations folder due to auto-reloading
      if (err.code === 'EIO') {
        this.wildebeest.verboseLogger.error(
          `Encountered i/o error: ${err.message}`,
        );
        this.wildebeest.verboseLogger.info('Retrying migration');
        await this.migrate();
      } else {
        this.wildebeest.verboseLogger.log(err);
        this.wildebeest.verboseLogger.log(err.code);
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

    // Then down to bottom
    await this.downTo(this.wildebeest.bottomTest + 1);

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
    return Migration.up({
      to: this.wildebeest.lookupMigration[Number(to)].fileName,
    });
  }

  /**
   * Wipe the db
   *
   * @returns The wipe promise
   */
  public async wipe(): Promise<void> {
    // Run all the way down
    await this.dropAll();

    // Re-setup
    await this.wildebeest.setup();
  }
}
