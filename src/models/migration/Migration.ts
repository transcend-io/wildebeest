/**
 *
 * ## Migration Model
 * A database model for a Migration request.
 *
 * @module migration/Migration
 * @see module:migration
 */

// external modules
import { DataTypes, Model } from 'sequelize';
import Umzuger, {
  DownToOptions,
  ExecuteOptions,
  Umzug,
  UpDownMigrationsOptions,
  UpToOptions,
} from 'umzug';

// wildebeest
import { restoreFromDump, tableExists } from '@wildebeest/utils';
import { NUMBERED_REGEX } from '@wildebeest/utils/getNumberedList';
import { transactionWrapper } from '@wildebeest/utils/createQueryMaker';

// local
import { MIGRATIONS_PATH } from './constants';
import { logging, logSection } from './lib';

/**
 * A Migration db model
 */
export default class Migration extends Model {
  /** An instance of umzug */
  public static _umzug?: Umzug;

  /** The current batch number to add */
  public static batch: number;

  /**
   * Runs the migrations backwards
   *
   * @param options - Options
   * @returns The down promise
   */
  public static async down(options: DownToOptions): Promise<void> {
    // Run umzug down
    return logSection(() => this.umzug().down(options));
  }

  /**
   * Arbitrary execution
   *
   * @param options - Options
   * @returns The execute promise
   */
  public static async execute(options: ExecuteOptions): Promise<void> {
    await this.setBatch();
    // Run umzug execute and set batch
    return logSection(() =>
      this.umzug()
        .execute(options)
        .then(() => this.setBatch()),
    );
  }

  /**
   * Get the latest migration
   *
   * @returns The latest migration that has been one
   */
  public static latest(): Promise<Migration> {
    return this.findOne({ order: [['name', 'DESC']] });
  }

  /**
   * Increments the batch number of the migration model
   *
   * @returns The setBatch promise
   */
  public static async setBatch(): Promise<void> {
    if (this.batch) {
      this.batch += 1;
    } else {
      const last = await this.latest();
      this.batch = last ? last.batch + 1 : 1;
    }
  }

  /**
   * Ensure that the migrations table is setup
   *
   * @returns The setup promise
   */
  public static async setup(): Promise<void> {
    // Check if the migrations table exists
    const exists = await tableExists(this.db, this.constructor.tableName);

    // If the table does not exist yet, restore the genesis migration and indicate the first migration ocurred
    if (!exists) {
      restoreFromDump(RESTORE_ON_EMPTY);
    }

    // Run the first migration if it has not been run yet
    const hasMigrations = await this.count().then((cnt) => cnt > 0);
    if (!hasMigrations) {
      await this.execute({
        migrations: [LOOKUP_MIGRATIONS[1].fileName],
        method: 'up',
      });
    }
  }

  /**
   * Get the umzug instance that runs the migrations
   *
   * @returns The umzug instance
   */
  public static umzug(): Umzug {
    /* eslint-disable no-underscore-dangle */
    // Return the instance if it is already instantiated
    if (this._umzug) {
      return this._umzug;
    }
    const { db } = this;

    // Create a new instance
    this._umzug = new Umzuger({
      storage: 'sequelize',
      // The table to hold the migrations
      storageOptions: {
        sequelize: db,
        modelName: this.name,
        tableName: this.tableName,
        columnName: 'name',
      },
      // Migration logger
      logging,
      // The migrations to run
      migrations: {
        pattern: NUMBERED_REGEX,
        params: [
          // The database
          Object.assign(db, { DataTypes }),
          // A transaction wrapper
          transactionWrapper(db),
          // This
          this,
        ],
        path: MIGRATIONS_PATH,
      },
    });
    return this._umzug;
  } /* eslint-enable no-underscore-dangle */

  /**
   * Runs migrations. If a unique constraint error occurs on the first migration, the migration will restart.
   *
   * @param options - Options
   * @returns The up promise
   */
  public static async up(
    options: UpToOptions | UpDownMigrationsOptions,
  ): Promise<void> {
    await this.setBatch();
    return logSection(async () => {
      // Set the batch
      await this.setBatch();

      // To deal with the primary key issue
      let restartFrom;

      // Call up
      await this.umzug()
        .up(options)
        .catch((e) => {
          // Deal with weird case when loading in an existing db with migrations
          if (
            options &&
            options.from === '0001-initialize.js' &&
            e.name === 'SequelizeUniqueConstraintError'
          ) {
            restartFrom = LOOKUP_MIGRATIONS[2].fileName;
            return this.create({ name: restartFrom });
          }
          throw e;
        });

      // restart the migrations if the primary key issue occurred
      if (restartFrom) {
        // Call up
        await this.umzug().up({ ...options, from: restartFrom });
      }
    });
  }

  /** Primary key, auto increment */
  public id!: number;

  /** Time the API key was created */
  public readonly createdAt!: Date;

  /** Time the API key was updated */
  public readonly updatedAt!: Date;

  /** The name of the migration */
  public name!: string;

  /** The batch in which the migration was run in */
  public batch!: number;

  /**
   * The name of the migration file
   *
   * @returns The name of the migration file
   */
  public fileName(): string {
    return `${this.name}.js`;
  }

  /**
   * The migrations number
   *
   * @returns The number of the migration file
   */
  public num(): string {
    return this.name.substring(0, 4);
  }
}
