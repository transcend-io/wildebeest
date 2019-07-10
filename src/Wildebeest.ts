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
import { join } from 'path';
import { DataTypes, Sequelize } from 'sequelize';

// utils
import { checkExtraneousTables, checkModel } from '@wildebeest/checks';
import getNumberedList from '@wildebeest/utils/getNumberedList';

// models
import Migration from '@wildebeest/models/migration/Migration';
import MigrationLock from '@wildebeest/models/migrationLock/MigrationLock';

// local
import { DEFAULT_NAMING_CONVENTIONS, MAX_MIGRATION_DISPLAY } from './constants';
import { DefaultModelNames } from './enums';
import Logger, { verboseLoggerDefault } from './Logger';
import { MigrationConfig, ModelDefinition, SequelizeMigrator } from './types';

/**
 * Only a subset of the naming conventions need to be overwritten
 */
export type NamingConventions = typeof DEFAULT_NAMING_CONVENTIONS;

/**
 * The opitons needed to configure a wildebeest
 */
export type WildebeestOptions = {
  /** The database to migrate against */
  db: Sequelize;
  /** Needed to restore schema dumps using pg_restore and pg_dump */
  databaseUri: string;
  /** The path to the folder where the migrations themselves are defined */
  directory: string;
  /** The directory that holds schemas dump */
  schemaDirectory: string;
  /** The name of the schehma file to be used to restore the database to when it is completed empty */
  restoreSchemaOnEmpty: string;
  /** A logger that that should always log results. This is used mainly for logging errors and critical information */
  logger?: Logger;
  /** A logger that that should only log when verbose is true */
  verboseLogger?: Logger;
  /** Override the names of the db models */
  modelNames?: typeof DefaultModelNames;
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
};

/**
 * A migration runner interface
 * TODO move to own file
 */
export default class Wildebeest {
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
  public db: SequelizeMigrator;

  /** Needed to restore schema dumps using pg_restore and pg_dump */
  public databaseUri: string;

  /** Override the naming conventions */
  public namingConventions: NamingConventions;

  /** Names of the db models */
  public modelNames: typeof DefaultModelNames;

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

  /** Blacklisted tables that should be ignored when syncing table */
  public ignoredTableNames: string[];

  /**
   * Initialize a wildebeest migration runner
   */
  public constructor({
    db,
    directory,
    schemaDirectory,
    databaseUri,
    restoreSchemaOnEmpty,
    s3 = new S3(),
    ignoredTableNames = [],
    namingConventions = {},
    logger = new Logger(),
    verboseLogger = verboseLoggerDefault,
    modelNames = DefaultModelNames,
    maxMigrationDisplay = MAX_MIGRATION_DISPLAY,
    forceUnlock = false,
  }: WildebeestOptions) {
    // The db as a sequelize migrator
    this.db = Object.assign(db, {
      DataTypes,
      queryInterface: db.getQueryInterface(),
    });
    this.modelNames = modelNames;
    this.databaseUri = databaseUri;
    this.ignoredTableNames = ignoredTableNames;
    this.forceUnlock = forceUnlock;

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
  }

  /**
   * Ensure migration tables are setup and run migrations all of the way forward
   *
   * @returns The schema written
   */
  public async migrate(): Promise<void> {
    // Ensure the migrations table it setup
    await Migration.setup();

    // Unlock if force is un
    if (this.forceUnlock) {
      await MigrationLock.releaseLock();
    }

    // Run the new migrations if auto migrate is on
    await MigrationLock.runWithLock((lock) => lock.migrate());
  }

  /**
   * Test whether the sequelize definitions are in sync with postgres
   *
   * @param models - The model definitions to check for
   * @returns True if the model definitions are exactly defined in the db
   */
  public async isSynced(models: ModelDefinition[]): Promise<boolean> {
    const results = await Promise.all([
      // Check that each model is in sync
      ...models.map((model) => checkModel(this, model)),
      // Check for extra tables
      checkExtraneousTables(
        this,
        models.map(({ tableName }) => tableName).concat(this.ignoredTableNames),
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
}
