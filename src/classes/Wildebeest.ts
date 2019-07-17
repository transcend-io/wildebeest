/* eslint-disable max-lines */
/**
 *
 * ## Wildebeest Class Definition
 * The main migration runner and checking class definition
 *
 * @module Wildebeest
 */

// external modules
import { S3 } from 'aws-sdk';
import { existsSync, readdirSync } from 'fs';
import keyBy from 'lodash/keyBy';
import { join } from 'path';
import pluralize from 'pluralize';
import { Options } from 'sequelize';
import Umzug from 'umzug';

// utils
import apply from '@wildebeest/utils/apply';
import configureModelDefinition from '@wildebeest/utils/configureModelDefinition';
import { transactionWrapper } from '@wildebeest/utils/createQueryMaker';
import createUmzugLogger from '@wildebeest/utils/createUmzugLogger';
import getBackoffTime from '@wildebeest/utils/getBackoffTime';
import getNumberedList, {
  NUMBERED_REGEX,
} from '@wildebeest/utils/getNumberedList';
import restoreFromDump from '@wildebeest/utils/restoreFromDump';
import sleepPromise from '@wildebeest/utils/sleepPromise';
import tableExists from '@wildebeest/utils/tableExists';

// checks
import { checkExtraneousTables, checkModel } from '@wildebeest/checks';

// models
import Migration from '@wildebeest/models/migration/Migration';
import MigrationLock from '@wildebeest/models/migrationLock/MigrationLock';

// global
import {
  DEFAULT_NAMING_CONVENTIONS,
  MAX_LOCK_ATTEMPTS,
  MAX_MIGRATION_DISPLAY,
  MIGRATION_TIMEOUT,
  ONE_SECOND,
} from '@wildebeest/constants';
import { DefaultTableNames } from '@wildebeest/enums';
import Logger, { verboseLoggerDefault } from '@wildebeest/Logger';
import {
  ConfiguredModelDefinition,
  MigrationConfig,
  ModelDefinition,
  ModelMap,
} from '@wildebeest/types';

// local
import WildebeestDb from './WildebeestDb';

/**
 * Only a subset of the naming conventions need to be overwritten
 */
export type NamingConventions = typeof DEFAULT_NAMING_CONVENTIONS;

/**
 * The opitons needed to configure a wildebeest
 */
export type WildebeestOptions<TModels extends ModelMap> = {
  /** The uri of the database to connect o */
  databaseUri: string;
  /** The path to the folder where the migrations themselves are defined */
  directory: string;
  /** The directory that holds schemas dump */
  schemaDirectory: string;
  /** The name of the schehma file to be used to restore the database to when it is completed empty */
  restoreSchemaOnEmpty: string;
  /** The database model definitions to be validated */
  models: TModels;
  /** Options to provide to sequelize */
  sequelizeOptions?: Options;
  /** A logger that that should always log results. This is used mainly for logging errors and critical information */
  logger?: Logger;
  /** A logger that that should only log when verbose is true */
  verboseLogger?: Logger;
  /** Override the names of the db model tables */
  tableNames?: typeof DefaultTableNames;
  /** One can override the naming conventions */
  namingConventions?: Partial<NamingConventions>;
  /** The maximum number of migrations to display on a page when rendered */
  maxMigrationDisplay?: number;
  /** Blacklisted tables that should be ignored when syncing table */
  ignoredTableNames?: string[];
  /** The default AWS s3 instance to run s3 migrations against */
  s3?: S3;
  /** Can forcefully unlock the migration lock table (useful in testing or auto-reloading environment) */
  forceUnlock?: boolean;
  /** A function that will convert a model name to a table name, when inferring a table */
  pluralCase?: (word: string) => string;
  /** Expose a route that will allow schemas to be written to file (defaults to NODE_ENV === 'development') */
  allowSchemaWrites?: boolean;
  /** When true, anytime the migration lock is released, a sync check will be performed */
  alwaysCheckSync?: boolean;
  /** When testing migrations, this shold be the bottom migration to run down to. Defaults to 2 since 1 must be a genesis migration */
  bottomTest?: number;
};

/**
 * A migration runner interface
 */
export default class Wildebeest<TModels extends ModelMap> {
  /**
   * Index the migrations and validate that the numbering is correct
   */
  public static indexMigrations(directory: string): MigrationConfig[] {
    // Get and validate the migrations
    const files = getNumberedList(
      readdirSync(directory).filter((fil) => fil.indexOf('.') > 0),
    );

    // Convert to migration configurations
    return files.map((fileName) => ({
      numInt: parseInt(fileName.substring(0, 4), 10),
      num: fileName.substring(0, 4),
      name: fileName.substring(0, fileName.length - 3),
      fileName,
      fullPath: join(__dirname, fileName),
    }));
  }

  // // //
  // Db //
  // // //

  /** The database to migrate against */
  public db: WildebeestDb<TModels>;

  /** The database model definitions to be validated */
  public models: TModels;

  /** The configured database model definitions */
  public modelDefinitions: { [modelName in string]: ModelDefinition };

  /** The configured database model definitions */
  public configuredModels: { [modelName in string]: ConfiguredModelDefinition };

  /** Needed to restore schema dumps using pg_restore and pg_dump */
  public databaseUri: string;

  /** Override the naming conventions */
  public namingConventions: NamingConventions;

  /** Names of the db models */
  public tableNames: typeof DefaultTableNames;

  /** The name of the schehma file to be used to restore the database to when it is completed empty */
  public restoreSchemaOnEmpty: string;

  /** Can forcefully unlock the migration lock table (useful in testing or auto-reloading environment) */
  public forceUnlock: boolean;

  // /////////// //
  // Directories //
  // /////////// //

  /** The path to the folder where the migrations themselves are defined */
  public directory: string;

  /** The directory that holds schemas dump */
  public schemaDirectory: string;

  // /////// //
  // Loggers //
  // /////// //

  /** A logger that that should always log results. This is used mainly for logging errors and critical information */
  public logger: Logger;

  /** A logger that that should only log when verbose is true */
  public verboseLogger: Logger;

  // ///////////////// //
  // Controller Routes //
  // ///////////////// //

  /** Maximum number of migrations to display on a single page */
  public maxMigrationDisplay: number;

  // // //
  // S3 //
  // // //

  /** The default connection to s3 */
  public s3: S3;

  // //// //
  // Misc //
  // //// //

  /** The list of migrations to run */
  public migrations: MigrationConfig[];

  /** For accessibiliy in reverse order */
  public reversedMigrations: MigrationConfig[];

  /** Lookup from number to migration config */
  public lookupMigration: { [num in number]: MigrationConfig };

  /** Blacklisted tables that should be ignored when syncing table */
  public ignoredTableNames: string[];

  /** A function that will convert a model name to a table name, when inferring a table */
  public pluralCase: (word: string) => string;

  /** When true, expose a route to allow schema writes */
  public allowSchemaWrites: boolean;

  /** When true, anytime the migration lock is released, a sync check will be performed */
  public alwaysCheckSync: boolean;

  /** When testing migrations, this shold be the bottom migration to run down to */
  public bottomTest: number;

  /** The umzug instance that will run the migrations up and down */
  public umzug: Umzug.Umzug;

  /**
   * Initialize a wildebeest migration runner
   */
  public constructor({
    directory,
    sequelizeOptions,
    schemaDirectory,
    databaseUri,
    restoreSchemaOnEmpty,
    models,
    bottomTest = 2,
    s3 = new S3(),
    ignoredTableNames = [],
    namingConventions = {},
    logger = new Logger(),
    verboseLogger = verboseLoggerDefault,
    tableNames = DefaultTableNames,
    maxMigrationDisplay = MAX_MIGRATION_DISPLAY,
    forceUnlock = false,
    pluralCase = pluralize,
    allowSchemaWrites = process.env.NODE_ENV === 'development',
    alwaysCheckSync = process.env.NODE_ENV === 'production',
  }: WildebeestOptions<TModels>) {
    // The db as a sequelize migrator
    this.db = new WildebeestDb(databaseUri, sequelizeOptions);
    this.tableNames = tableNames;
    this.databaseUri = databaseUri;
    this.ignoredTableNames = ignoredTableNames;
    this.forceUnlock = forceUnlock;
    this.pluralCase = pluralCase;
    this.allowSchemaWrites = allowSchemaWrites;
    this.models = models;
    this.modelDefinitions = apply(models, ({ definition }) => definition);
    this.alwaysCheckSync = alwaysCheckSync;
    this.bottomTest = bottomTest;

    // Save the loggers
    this.logger = logger;
    this.verboseLogger = verboseLogger;

    // The naming conventions
    this.namingConventions = {
      ...DEFAULT_NAMING_CONVENTIONS,
      ...namingConventions,
    };

    // Index the migrations
    this.directory = directory;
    this.migrations = Wildebeest.indexMigrations(directory);
    this.reversedMigrations = [...this.migrations].reverse();
    this.lookupMigration = keyBy(this.migrations, 'numInt');

    // schema
    this.schemaDirectory = schemaDirectory;
    this.restoreSchemaOnEmpty = restoreSchemaOnEmpty;
    if (!this.schemaExists(restoreSchemaOnEmpty)) {
      throw new Error(
        `The schema definition provided does not exist: ${restoreSchemaOnEmpty}: ${this.getSchemaFile(
          restoreSchemaOnEmpty,
        )}`,
      );
    }

    // Controller routes
    this.maxMigrationDisplay = maxMigrationDisplay;

    // The default s3
    this.s3 = s3;

    // Configure the model definitions
    this.configuredModels = apply(this.modelDefinitions, (model, modelName) =>
      configureModelDefinition(this, modelName, model),
    );

    // Initialize the umzug instance
    this.umzug = new Umzug({
      storage: 'sequelize',
      // The table to hold the migrations
      storageOptions: {
        sequelize: this.db,
        modelName: 'migration',
        tableName: this.tableNames.migration,
        columnName: 'name',
      },
      // Migration logger
      logging: createUmzugLogger(this.logger),
      // The migrations to run
      migrations: {
        pattern: NUMBERED_REGEX,
        params: [
          // The database
          this,
          // A transaction wrapper
          transactionWrapper(this),
          // This
          this,
        ],
        path: this.directory,
      },
    });

    // Initialize all of the models
    this.initializeModels();
  }

  /**
   * Lookup the model definition by model name
   *
   * @param modelName - The model name to lookup
   * @returns Its model definition, throws error if not found
   */
  public getModelDefinition(modelName: string): ModelDefinition {
    const model = this.modelDefinitions[modelName];
    if (!model) {
      throw new Error(`Could not find model for: "${modelName}"`);
    }
    return model;
  }

  /**
   * Ensure that the migration tables are setup
   *
   * @returns The setup promise
   */
  public async setup(): Promise<void> {
    // Check if the migrations table exists
    const exists = await tableExists(this.db, this.tableNames.migration);

    // If the table does not exist yet, restore the genesis migration and indicate the first migration ocurred
    if (!exists) {
      restoreFromDump(this, this.restoreSchemaOnEmpty);
    }

    // Run the first migration if it has not been run yet
    const hasMigrations = await Migration.count().then((cnt) => cnt > 0);
    if (!hasMigrations) {
      await Migration.execute({
        migrations: [this.lookupMigration[1].fileName],
        method: 'up',
      });
    }
  }

  /**
   * Ensure migration tables are setup and run migrations all of the way forward
   *
   * @returns The schema written
   */
  public async migrate(): Promise<void> {
    // Ensure the migrations table it setup
    await this.setup();

    // Unlock if force is un
    if (this.forceUnlock) {
      await MigrationLock.releaseLock();
    }

    // Run the new migrations if auto migrate is on
    await this.runWithLock((lock) => lock.migrate());
  }

  /**
   * Test whether the sequelize definitions are in sync with postgres
   *
   * @returns True if the model definitions are exactly defined in the db
   */
  public async isSynced(): Promise<boolean> {
    const results = await Promise.all([
      // Check that each model is in sync
      ...Object.entries(this.configuredModels).map(([modelName, model]) =>
        checkModel(this, model, modelName),
      ),
      // Check for extra tables
      checkExtraneousTables(
        this,
        Object.entries(this.configuredModels)
          .map(([, { tableName }]) => tableName)
          .concat(this.ignoredTableNames),
      ),
    ]);
    return results.filter((synced) => !synced).length === 0;
  }

  /**
   * Validate whether a schema exists
   *
   * @param schemaName - The name of the schema to checl
   * @returns True if it exists
   */
  public schemaExists(schemaName: string): boolean {
    return existsSync(this.getSchemaFile(schemaName));
  }

  /**
   * Validate whether a schema exists
   *
   * @param schemaName - The name of the schema to checl
   * @returns The absolute path to the schema
   */
  public getSchemaFile(schemaName: string): string {
    return join(this.schemaDirectory, `${schemaName}.dump`);
  }

  /**
   * Run a function within the acquired migration lock.
   *
   * Will acquire the lock and wait when the lock is already acquired.
   * Once the lock is acquired, it will run the function provided
   *
   * @param cb - The function to run with the acquired lock
   * @returns The amount of time it took to run in ms
   */
  public async runWithLock(
    cb: (lock: MigrationLock<ModelMap>) => Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<number> {
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
        // Only try MAX_LOCK_ATTEMPTS times
        attempts += 1;
        if (attempts > MAX_LOCK_ATTEMPTS) {
          throw new Error('Unable to acquire migration lock.');
        }

        // Wait a random amount of time with expo backoff
        const sleepTime = getBackoffTime(attempts, MIGRATION_TIMEOUT);
        await sleepPromise(sleepTime);

        // Attempt to acquire the lock
        lock = await MigrationLock.acquireLock();

        // Log when lock is not acquired
        if (!lock) {
          this.logger.info(
            `Detected migration occurring, sleeping randomly up to ${sleepTime /
              ONE_SECOND} seconds`,
          );
        }
      } /* eslint-enable */

      this.verboseLogger.success('~Acquired migration lock~');

      // Run the callback function
      await Promise.resolve(cb(lock));

      // Release the lock
      await MigrationLock.releaseLock();

      this.verboseLogger.success('~Released migration lock~');
    } catch (err) {
      // Unlock if error occurred while running
      if (lock) {
        await MigrationLock.releaseLock();
        lock = null;
      }

      // Still throw the error
      throw err;
    }
    // Timer end
    const end = new Date().getTime();

    // Check that the db is in sync
    if (this.alwaysCheckSync) {
      await this.syncTest();
    }

    // The time it took
    return end - start;
  }

  /**
   * Test if the model definitions are properly setup
   *
   * @returns True on success. Will throw an error if alwaysCheckSync=true
   */
  public async syncTest(): Promise<boolean> {
    this.logger.info('Checking if the db is in sync...');

    // Determine if the db is out of sync
    const isSynced = await this.isSynced();

    // throw an error if the setup is invalid
    if (!isSynced) {
      const msg =
        'The db is out of sync with Sequelize definitions. View output above to see where.';
      if (this.alwaysCheckSync) {
        throw new Error(msg);
      } else {
        this.logger.error(msg);
      }

      // Log success
    } else {
      this.logger.success('Database is in sync with sequelize definitions :)');
    }

    // Return true if in sync
    return isSynced;
  }

  /**
   * Initialize all of the sequelize models
   */
  private initializeModels(): void {
    // Initialize the migration models
    Migration.customInit(this, 'migration', this.tableNames.migration);
    MigrationLock.customInit(
      this,
      'migrationLock',
      this.tableNames.migrationLock,
    );

    // Initialize the remaining models
    apply(this.models, (ModelDef, name) => ModelDef.customInit(this, name));

    // Set their relations once all have been initialized
    apply(this.models, (ModelDef, name) =>
      ModelDef.createRelations(this, name),
    );
  }
}
