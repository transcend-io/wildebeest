/**
 *
 * ## Migration Methods
 * Db model class methods for the migration model.
 *
 * @module migration/methods
 * @see module:migration
 */

// external
import { DataTypes } from 'sequelize';
import Umzug from 'umzug';

// commons
import { NUMBERED_REGEX } from '@commons/utils/getNumberedList';

// wildebeest
import { LOOKUP_MIGRATIONS } from '@wildebeest/constants';
import { RESTORE_ON_EMPTY } from '@wildebeest/envs';
import { restoreFromDump } from '@wildebeest/helpers';
import { transactionWrapper } from '@wildebeest/helpers/createQueryMaker';

// local
import { MIGRATIONS_PATH } from './constants';
import { logging, logSection } from './lib';
import { MigrationInstance } from './types';

/**
 * Runs the migrations backwards
 *
 * @param {module:migrations/typeDefs.MigrateOptions} options - Options
 * @returns The down promise
 */
export async function down(options): Promise<void> {
  // Run umzug down
  return logSection(() => this.umzug().down(options));
}

/**
 * Arbitrary execution
 *
 * @param {module:migrations/typeDefs.MigrateOptions} options - Options
 * @returns The execute promise
 */
export async function execute(options): Promise<void> {
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
export function latest(): Promise<MigrationInstance> {
  return this.findOne({ order: [['name', 'DESC']] });
}

/**
 * Increments the batch number of the migration model
 *
 * @returns The setBatch promise
 */
export async function setBatch(): Promise<void> {
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
export async function setup(): Promise<void> {
  // Check if the migrations table exists
  const exists = await this.getClass().tableExists();

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
export function umzug(): Promise<Umzug> {
  /* eslint-disable no-underscore-dangle */
  // Return the instance if it is already instantiated
  if (this._umzug) {
    return this._umzug;
  }
  const { db } = this;

  // Create a new instance
  this._umzug = new Umzug({
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
 * @param {module:migrations/typeDefs.MigrateOptions} options - Options
 * @returns The up promise
 */
export async function up(options): Promise<void> {
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
      const { from, ...rest } = options; // eslint-disable-line @typescript-eslint/no-unused-vars
      // Call up
      await this.umzug().up({ from: restartFrom, ...rest });
    }
  });
}
