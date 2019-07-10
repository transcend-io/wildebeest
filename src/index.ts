/**
 *
 * ## DB Migrations
 * Migration files for migrating the db using Sequelize and Umzug
 *
 * @module wildebeest
 */

// external modules
import { S3 } from 'aws-sdk';
import { readdirSync, existsSync } from 'fs';
import snakeCase from 'lodash/snakeCase';
import { join } from 'path';
import { DataTypes, ModelIndexesOptions, Sequelize } from 'sequelize';

// local
import { MAX_MIGRATION_DISPLAY } from './constants';
import Logger, { verboseLoggerDefault } from './Logger';
import { MigrationConfig, SequelizeMigrator } from './types';
import getNumberedList from './utils/getNumberedList';

// export types in index
export * from './types';

/**
 * The names of the db models can be overwritten
 */
export const DefaultModelNames = {
  migrationLock: 'migrationLocks',
  migration: 'migrations',
};

/**
 * One can override the naming conventions for various database values
 */
export const defaultNamingConventions = {
  /**
   * An index on a column
   */
  columnIndex: (tableName: string, columnName: string): string =>
    columnName === 'id'
      ? `${tableName}_pkey`
      : `${tableName}_${columnName}_key`,
  /**
   * A foreign key constraint on a column
   */
  foreignKeyConstraint: (tableName: string, columnName: string): string =>
    `${tableName}_${columnName}_fkey`,
  /**
   * A unique constraint on a single column
   */
  uniqueConstraint: (tableName: string, columnName: string): string =>
    `${tableName}_${columnName}_key`,
  /**
   * The name of an enum
   */
  enum: (tableName: string, columnName: string): string =>
    `enum_${tableName}_${columnName}`,
  /**
   * A unique conostraint across a number of columns
   */
  fieldsConstraint: (
    tableName: string,
    fields: Required<ModelIndexesOptions>['fields'],
  ): string =>
    `${snakeCase(tableName)}_${fields
      .map((word) => snakeCase(typeof word === 'string' ? word : word.name))
      .join('_')}`,
};

/**
 * Only a subset of the naming conventions need to be overwritten
 */
export type NamingConventions = typeof defaultNamingConventions;

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
};

/**
 * A migration runner interface
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

  /**
   * Initialize a wildebeest migration runner
   */
  public constructor({
    db,
    directory,
    schemaDirectory,
    databaseUri,
    namingConventions = {},
    logger = new Logger(),
    verboseLogger = verboseLoggerDefault,
    modelNames = DefaultModelNames,
    maxMigrationDisplay = MAX_MIGRATION_DISPLAY,
  }: WildebeestOptions) {
    // The db as a sequelize migrator
    this.db = Object.assign(db, {
      DataTypes,
      queryInterface: db.getQueryInterface(),
    });
    this.modelNames = modelNames;
    this.databaseUri = databaseUri;

    // Save the loggers
    this.logger = logger;
    this.verboseLogger = verboseLogger;

    // The naming conventions
    this.namingConventions = {
      ...defaultNamingConventions,
      ...namingConventions,
    };

    // Index the migrations
    this.directory = directory;
    this.schemaDirectory = schemaDirectory;
    this.migrations = Wildebeest.indexMigrations(directory);

    // Controller routes
    this.maxMigrationDisplay = maxMigrationDisplay;

    // TODO check genesis schema
  }

  /**
   * Ensure migration tables are setup and run migrations.
   *
   * @returns The schema written
   */
  public async runMigrations(): Promise<void> {
    // Ensure the migrations table it setup
    await this.Migration.setup();

    // Unlock if force is un
    if (this.forceUnlock) {
      await this.MigrationLock.releaseLock();
    }

    // Run the new migrations if auto migrate is on
    if (this.autoMigrate) {
      await this.MigrationLock.runWithLock((lock) => lock.migrate());
    }
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
