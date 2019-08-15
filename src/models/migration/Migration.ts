/**
 *
 * ## Migration Model
 * A database model for a Migration request.
 *
 * @module migration/Migration
 * @see module:migration
 */

// external modules
import {
  DownToOptions,
  ExecuteOptions,
  UpToOptions as UmzugUpToOptions,
} from 'umzug';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestModel from '@wildebeest/classes/WildebeestModel';
import { ExtractAttributes, ModelMap, UpToOptions } from '@wildebeest/types';
import logSection from '@wildebeest/utils/logSection';

// local
import attributes from './attributes';
import * as options from './options';

/**
 * A Migration db model
 */
export default class Migration<TModels extends ModelMap>
  extends WildebeestModel<TModels, number>
  implements ExtractAttributes<typeof attributes> {
  /** The model definition */
  public static definition = {
    attributes,
    options,
  };

  /** The current batch number to add */
  public static batch: number;

  /**
   * Runs the migrations backwards
   *
   * @param cb - The cb function to call inside the section
   * @param header - Header for section
   * @returns The down promise
   */
  public static async logSection(
    cb: (wildebeest: Wildebeest<ModelMap>) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
    header?: string,
  ): Promise<void> {
    const { wildebeest } = this;
    // Ensure init has been called
    if (!wildebeest) {
      throw new Error(
        `Cannot access wildebeest until Model.customInit has been called`,
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
    return this.logSection((wildebeest) => wildebeest.umzug.down(downOptions));
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
    return this.logSection((wildebeest) =>
      wildebeest.umzug.execute(executeOptions).then(() => this.setBatch()),
    );
  }

  /**
   * Get the latest migration
   *
   * @returns The latest migration that has been one
   */
  public static latest(): Promise<Migration<ModelMap>> {
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
    return this.logSection(async (wildebeest) => {
      // Set the batch
      await this.setBatch();

      // To deal with the primary key issue
      let restartFrom;

      // Call up
      await wildebeest.umzug.up(upOptions as UmzugUpToOptions).catch((e) => {
        // Deal with weird case when loading in an existing db with migrations
        if (
          upOptions &&
          upOptions.from === '0001-initialize.js' &&
          e.name === 'SequelizeUniqueConstraintError'
        ) {
          restartFrom =
            wildebeest.lookupMigration[wildebeest.bottomTest].fileName;
          return this.create({ name: restartFrom });
        }
        throw e;
      });

      // restart the migrations if the primary key issue occurred
      if (restartFrom) {
        // Call up
        const castedUpTo: UmzugUpToOptions = {
          ...upOptions,
          from: restartFrom,
        } as any; // eslint-disable-line
        await wildebeest.umzug.up(castedUpTo);
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
