/* eslint-disable max-lines */
/**
 * The main migration runner and checking class definition
 */

// external
import { S3 } from 'aws-sdk';
import * as express from 'express';
import { existsSync, readdirSync } from 'fs';
import flatten from 'lodash/flatten';
import keyBy from 'lodash/keyBy';
import { join } from 'path';
import pluralize from 'pluralize';
import { Options, Transaction } from 'sequelize';
import Umzug from 'umzug';

// utils
import apply from '@wildebeest/utils/apply';
import { transactionWrapper } from '@wildebeest/utils/createQueryMaker';
import createUmzugLogger from '@wildebeest/utils/createUmzugLogger';
import getBackoffTime from '@wildebeest/utils/getBackoffTime';
import getNumberedList, {
  NUMBERED_REGEX,
} from '@wildebeest/utils/getNumberedList';
import pascalCase from '@wildebeest/utils/pascalCase';
// utils
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
import createRoutes from '@wildebeest/routes';
import {
  Attributes,
  MigrationConfig,
  ModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';
import { getStringKeys } from '@wildebeest/utils/getKeys';

// local
import WildebeestDb from './WildebeestDb';

/**
 * Only a subset of the naming conventions need to be overwritten
 */
export type NamingConventions = typeof DEFAULT_NAMING_CONVENTIONS;

/**
 * The options needed to configure a wildebeest
 */
export type WildebeestOptions<TModels extends ModelMap> = {
  /** The uri of the database to connect to */
  databaseUri: string;
  /** The path to the folder where the migrations themselves are defined */
  directory: string;
  /** The directory that holds schemas dump */
  schemaDirectory: string;
  /** The name of the schema file to be used to restore the database to when it is completed empty */
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
  /** The default attributes to add to every model (ID, createdAt, updatedAt), set this to remove these columns */
  defaultAttributes?: Attributes;
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
  /** For throwing errors that should be exposed to a client i.e. "This id does not exist!" */
  throwClientError?: (err: string) => never;
  /** A function that will convert a model name to a table name, when inferring a table */
  pluralCase?: (word: string) => string;
  /** Expose a route that will allow schemas to be written to file (defaults to NODE_ENV === 'development') */
  allowSchemaWrites?: boolean;
  /**
   * When true, every-time migration are run, a sync check will be performed and an error is thrown if the check fails
   *
   * This will also throw an error if `syncTest` fails
   */
  errOnSyncFailure?: boolean;
  /** When testing migrations, this should be the bottom migration to run down to. Defaults to 2 since 1 must be a genesis migration */
  bottomTest?: number;
  /** Wait for migration to finish */
  waitForMigration?: boolean;
};

/**
 * A migration runner interface
 */
export default class Wildebeest<TModels extends ModelMap> {
  /**
   * Index the migrations and validate that the numbering is correct
   */
  public static indexMigrations(
    directory: string,
    bottom: number,
  ): MigrationConfig[] {
    // Get and validate the migrations
    const files = getNumberedList(
      readdirSync(directory).filter((fil) => fil.indexOf('.') > 0),
      bottom,
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
  public modelDefinitions: {
    [modelName in StringKeys<TModels>]: ModelDefinition<StringKeys<TModels>>;
  };

  /** Needed to restore schema dumps using pg_restore and pg_dump */
  public databaseUri: string;

  /** Override the naming conventions */
  public namingConventions: NamingConventions;

  /** Names of the db models */
  public tableNames: typeof DefaultTableNames;

  /** The name of the schema file to be used to restore the database to when it is completed empty */
  public restoreSchemaOnEmpty: string;

  /** Can forcefully unlock the migration lock table (useful in testing or auto-reloading environment) */
  public forceUnlock: boolean;

  /** Default attributes to assign to every model */
  public defaultAttributes: Attributes;

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

  /** For throwing errors that should be exposed to a client i.e. "This id does not exist!" */
  public throwClientError: (err: string) => never;

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

  /** For accessibility in reverse order */
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
  public errOnSyncFailure: boolean;

  /** When testing migrations, this should be the bottom migration to run down to */
  public bottomTest: number;

  /** The umzug instance that will run the migrations up and down */
  public umzug: Umzug.Umzug;

  /** A router containing routes that can be used to run migrations and check the status of synced models */
  public router: express.Router;

  /** Run table migration when DB empty */
  public waitForMigration: boolean;

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
    bottomTest = 1,
    s3 = new S3(),
    throwClientError = (err: string) => {
      throw new Error(err);
    },
    ignoredTableNames = [],
    namingConventions = {},
    defaultAttributes = {},
    logger = new Logger(),
    verboseLogger = verboseLoggerDefault,
    tableNames = DefaultTableNames,
    maxMigrationDisplay = MAX_MIGRATION_DISPLAY,
    forceUnlock = false,
    pluralCase = pluralize,
    allowSchemaWrites = process.env.NODE_ENV === 'development',
    errOnSyncFailure = process.env.NODE_ENV === 'production',
    waitForMigration = false,
  }: WildebeestOptions<TModels>) {
    // The db as a sequelize migrator
    this.db = new WildebeestDb(databaseUri, sequelizeOptions);
    this.tableNames = tableNames;
    this.databaseUri = databaseUri;
    this.ignoredTableNames = ignoredTableNames;
    this.forceUnlock = forceUnlock;
    this.pluralCase = pluralCase;
    this.allowSchemaWrites = allowSchemaWrites;

    // Set models
    Migration.definition.tableName = this.tableNames.migration;
    MigrationLock.definition.tableName = this.tableNames.migrationLock;
    this.models = {
      ...models,
      migration: Migration,
      migrationLock: MigrationLock,
    };
    this.modelDefinitions = (apply(this.models, (model) =>
      model.getDefinition(),
    ) as any) as {
      [modelName in StringKeys<TModels>]: ModelDefinition<StringKeys<TModels>>;
    };

    // misc
    this.errOnSyncFailure = errOnSyncFailure;
    this.bottomTest = bottomTest;

    // Save the loggers
    this.logger = logger;
    this.verboseLogger = verboseLogger;
    this.throwClientError = throwClientError;

    // The naming conventions
    this.namingConventions = {
      ...DEFAULT_NAMING_CONVENTIONS,
      ...namingConventions,
    };

    // Index the migrations
    this.directory = directory;
    this.migrations = Wildebeest.indexMigrations(directory, this.bottomTest);
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
    this.defaultAttributes = defaultAttributes;

    // Initialize the umzug instance
    this.umzug = new Umzug({
      storage: 'sequelize',
      // The table to hold the migrations
      storageOptions: {
        sequelize: this.db,
        modelName: 'migration',
        tableName: this.tableNames.migration,
        columnName: 'name',
        timestamps: true,
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

    // Construct the router
    this.router = createRoutes(this);
    this.waitForMigration = waitForMigration;
  }

  /**
   * Lookup the model definition by model name
   *
   * @param modelName - The model name to lookup
   * @returns Its model definition, throws error if not found
   */
  public getModelDefinition(
    modelName: StringKeys<TModels>,
  ): ModelDefinition<StringKeys<TModels>> {
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
    // Check if migrations have finished running on another instance
    const isSetup = async (): Promise<boolean> => {
      // Table must exist
      const migrationsTableExists = await tableExists(
        this.db,
        this.tableNames.migration,
      );

      if (!migrationsTableExists) {
        return false;
      }

      // There must be at least one migration in the table
      const lastMigration = await this.models.migration.findOne({
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      if (!lastMigration) {
        return false;
      }

      // Ensure the migrations have been completed
      const last = this.migrations[this.migrations.length - 1];
      return lastMigration.name === last.fileName;
    };

    /* eslint-disable no-await-in-loop */
    while (!(await isSetup())) {
      // If the table does not exist yet, restore the genesis migration and indicate the first migration ocurred
      // Only run this from one node by controlling the value of waitForMigration
      if (!this.waitForMigration) {
        await restoreFromDump(this, this.restoreSchemaOnEmpty);

        // Run the first migration if it has not been run yet
        const hasMigrations = await Migration.count().then((cnt) => cnt > 0);
        if (!hasMigrations) {
          await Migration.execute({
            migrations: [this.lookupMigration[this.bottomTest].fileName],
            method: 'up',
          });
        }
        break;
      }

      this.logger.info('Waiting for the genesis migration to finish');
      // wait for some time
      await sleepPromise(MIGRATION_TIMEOUT);
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

    // Check if we need to migrate by comparing last migration
    // This is significantly faster on server start time than trying to acquire and run with lock
    const last = this.migrations[this.migrations.length - 1];
    if (last) {
      const { name } = await this.models.migration.findOne({
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      if (name === last.fileName) {
        this.logger.info('Skipping migrate because db is fully migrated');
        return;
      }
    }

    // Run the new migrations if auto migrate is on
    await this.runWithLock((lock) => lock.migrate());
  }

  /**
   * Test whether the sequelize definitions are in sync with postgres
   *
   * @returns True if the model definitions are exactly defined in the db
   */
  public async getSyncErrors(): Promise<SyncError[]> {
    const results = await Promise.all([
      // Check that each model is in sync
      ...getStringKeys(this.models).map((modelName) =>
        checkModel(
          this,
          this.models[modelName].configuredDefinition,
          modelName,
        ),
      ),
      // Check for extra tables
      checkExtraneousTables(
        this.db,
        getStringKeys(this.models)
          .map((modelName) => this.models[modelName].tableName)
          .concat(this.ignoredTableNames),
      ),
    ]);
    return flatten(results);
  }

  /**
   * Validate whether a schema exists
   *
   * @param schemaName - The name of the schema to check
   * @returns True if it exists
   */
  public schemaExists(schemaName: string): boolean {
    return existsSync(this.getSchemaFile(schemaName));
  }

  /**
   * Validate whether a schema exists
   *
   * @param schemaName - The name of the schema to check
   * @returns The absolute path to the schema
   */
  public getSchemaFile(schemaName: string): string {
    return join(this.schemaDirectory, `${schemaName}.dump`);
  }

  /**
   * Pluralize a word and convert to PascalCase
   *
   * @param word - The word to modify
   * @returns The word in plural& pascal case
   */
  public pascalPluralCase(word: string): string {
    return pascalCase(this.pluralCase(word));
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

    // Unlock if force is on
    if (this.forceUnlock) {
      await MigrationLock.releaseLock();
    }

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
            `Detected migration occurring, sleeping randomly up to ${
              sleepTime / ONE_SECOND
            } seconds`,
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
    if (this.errOnSyncFailure) {
      await this.syncTest();
    }

    // The time it took
    return end - start;
  }

  /**
   * Test if the model definitions are properly setup
   *
   * @returns True on success. Will throw an error if errOnSyncFailure=true
   */
  public async syncTest(): Promise<boolean> {
    this.logger.info('Checking if the db is in sync...');

    // Determine if the db is out of sync
    const errors = await this.getSyncErrors();

    // throw an error if the setup is invalid
    const isSynced = errors.length === 0;
    if (!isSynced) {
      // Log the errors
      errors.forEach((error) => this.logger.error(error.message));

      const msg = `The db is out of sync with Sequelize definitions. View output above to see where. (${errors.length})`;
      if (this.errOnSyncFailure) {
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
  public initializeModels(): void {
    // Initialize the remaining models
    apply(this.models, (ModelDef, name) =>
      ModelDef.customInit(
        this,
        name,
        ModelDef.definition.tableName || this.pluralCase(name),
      ),
    );

    // Set their relations once all have been initialized
    apply(this.models, (ModelDef) => ModelDef.createRelations());
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Verify that the db is setup and configured for migrations, useful to prevent execution of code until migrations have run
   */
  public async isOperable(transaction?: Transaction): Promise<boolean> {
    return MigrationLock.isOperable(transaction);
  }
  /* eslint-enable class-methods-use-this */
}
