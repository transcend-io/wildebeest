/**
 *
 * ## Database Migration Model
 * A database model for a migration
 *
 * @module models/Model
 * @see module:models
 */

// external modules
import { Model } from 'sequelize';

// global
import { ModelDefinition } from '@wildebeest/types';
import Wildebeest from '@wildebeest/Wildebeest';

/**
 * A MigrationLock db model
 */
export default class WildebeestModel extends Model {
  /** The wildebeest configuration is added on the customInit setup */
  public static wildebeest?: Wildebeest;

  /**
   * Wildebeest has a custom init function that also assigns wildebeest as an attribute on the class prototype
   *
   * @param model - The db model definition
   * @param wildebeest - The wildebeest instance
   * @returns Initializes the model
   */
  public static customInit(
    model: ModelDefinition,
    wildebeest: Wildebeest,
  ): void {
    // Call the sequelize init form the model definition
    WildebeestModel.init(model.attributes || {}, {
      ...model.options,
      tableName: model.tableName,
      sequelize: wildebeest.db,
    });

    // Attach wildebeest to the class instance and class itself
    Object.defineProperty(WildebeestModel.prototype, 'wildebeest', {
      get: () => wildebeest,
    });
    WildebeestModel.wildebeest = wildebeest;
  }

  /** Time the API key was created */
  public readonly createdAt!: Date;

  /** Time the API key was updated */
  public readonly updatedAt!: Date;

  /** The wildebeest configuration */
  public readonly wildebeest!: Wildebeest;
}
