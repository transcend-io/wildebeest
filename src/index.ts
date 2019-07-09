/**
 *
 * ## DB Migrations
 * Migration files for migrating the db using Sequelize and Umzug
 *
 * @module wildebeest
 */

// external modules
import { join } from 'path';
import { Sequelize } from 'sequelize';

// local
import Logger, { verboseLoggerDefault } from './Logger';
import { MigrationConfig } from './types';

/**
 * The names of the db models can be overwritten
 */
export const DefaultModelNames = {
  migrationLock: 'migrationLocks',
  migration: 'migrations',
};

/**
 * The opitons needed to configure a wildebeest
 */
export type WildebeestOptions = {
  /** The database to migrate against */
  db: Sequelize;
  /** The path to the folder where the migrations themselves are defined */
  directory: string;
  /** A logger that that should always log results. This is used mainly for logging errors and critical information */
  logger?: Logger;
  /** A logger that that should only log when verbose is true */
  verboseLogger?: Logger;
  /** Override the names of the db models */
  modelNames?: typeof DefaultModelNames;
};

/**
 * A migration runner interface
 */
export default class Wildebeest {
  /**
   * Index the migrations and validate that the numbering is correct
   */
  public static indexMigrations(directory: string): MigrationConfig[] {
    const files = getNumberedList(listFiles(directory));
    return files.map((fileName) => ({
      numInt: parseInt(fileName.substring(0, 4), 10),
      num: fileName.substring(0, 4),
      name: fileName.substring(0, fileName.length - 3),
      fileName,
      fullPath: join(__dirname, fileName),
    }));
  }

  /** The database to migrate against */
  public db: Sequelize;

  /** Names of the db models */
  public modelNames: typeof DefaultModelNames;

  /** The path to the folder where the migrations themselves are defined */
  public directory: string;

  /** The list of migrations to run */
  public migrations: MigrationConfig[];

  /** A logger that that should always log results. This is used mainly for logging errors and critical information */
  public logger: Logger;

  /** A logger that that should only log when verbose is true */
  public verboseLogger: Logger;

  /**
   * Initialize a wildebeest migration runner
   */
  public constructor({
    db,
    directory,
    logger = new Logger(),
    verboseLogger = verboseLoggerDefault,
    modelNames = DefaultModelNames,
  }: WildebeestOptions) {
    // The db
    this.db = db;
    this.modelNames = modelNames;

    // Save the loggers
    this.logger = logger;
    this.verboseLogger = verboseLogger;

    // Index the migrations
    this.directory = directory;
    this.migrations = Wildebeest.indexMigrations(directory);
  }
}
