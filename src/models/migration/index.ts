/**
 *
 * ## Migration Model
 * A database model for a Migration request.
 *
 * @module migration
 * @see module:migration/attributes
 * @see module:migration/options
 */

// external modules
import {
  DownToOptions,
  ExecuteOptions,
  UpToOptions as UmzugUpToOptions,
} from 'umzug';

// global
import WildebeestModel from '@wildebeest/models/Model';
import { ModelDefinition, UpToOptions } from '@wildebeest/types';
import logSection from '@wildebeest/utils/logSection';
import Wildebeest from '@wildebeest/Wildebeest';

// local
import * as attributes from './attributes';
import * as options from './options';

/**
 * A Migration db model
 */
export default class Migration extends WildebeestModel {
  /** The current batch number to add */
  public static batch: number;

  /** The model definition without the table name */
  public static definition: Partial<ModelDefinition> = {
    attributes,
    options,
  };

  /**
   * Runs the migrations backwards
   *
   * @param cb - The cb function to call inside the section
   * @param header - Header for section
   * @returns The down promise
   */
  public static async logSection(
    cb: (wildebeest: Wildebeest) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
    header?: string,
  ): Promise<void> {
    const { wildebeest } = this;
    // Ensure init has been called
    if (!wildebeest) {
      throw new Error(
        `Cannot access widlebeest until Model.customInit has been called`,
      );
    }

    // Run umzug down
    return logSection(wildebeest.logger, () => cb(wildebeest), header);
  }

  /**
   * Runs the migrations backwards
   *
   * @param downOptions - Options
   * @returns The down promise
   */
  public static async down(downOptions: DownToOptions): Promise<void> {
    // Run umzug down
    return this.logSection((widlebeest) => widlebeest.umzug.down(downOptions));
  }

  /**
   * Arbitrary execution
   *
   * @param executeOptions - Options
   * @returns The execute promise
   */
  public static async execute(executeOptions: ExecuteOptions): Promise<void> {
    await this.setBatch();
    // Run umzug execute and set batch
    return this.logSection((widlebeest) =>
      widlebeest.umzug.execute(executeOptions).then(() => this.setBatch()),
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
   * Runs migrations. If a unique constraint error occurs on the first migration, the migration will restart.
   *
   * @param upOptions - Options
   * @returns The up promise
   */
  public static async up(upOptions: UpToOptions): Promise<void> {
    await this.setBatch();
    return this.logSection(async (widlebeest) => {
      // Set the batch
      await this.setBatch();

      // To deal with the primary key issue
      let restartFrom;

      // Call up
      await widlebeest.umzug.up(upOptions as UmzugUpToOptions).catch((e) => {
        // Deal with weird case when loading in an existing db with migrations
        if (
          upOptions &&
          upOptions.from === '0001-initialize.js' &&
          e.name === 'SequelizeUniqueConstraintError'
        ) {
          restartFrom = widlebeest.lookupMigration[2].fileName;
          return this.create({ name: restartFrom });
        }
        throw e;
      });

      // restart the migrations if the primary key issue occurred
      if (restartFrom) {
        // Call up
        const castedUpTo: UmzugUpToOptions = {
          ...options,
          from: restartFrom,
        } as any; // eslint-disable-line
        await widlebeest.umzug.up(castedUpTo);
      }
    });
  }

  /** Primary key, auto increment */
  public id!: number;

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
