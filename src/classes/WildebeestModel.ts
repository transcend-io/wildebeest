/**
 *
 * ## Wildebeest Db Model
 * A database model definied for the wildebeest db management tooling
 *
 * @module models/Model
 * @see module:models
 */

// external modules
import { Model } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { DefaultTableNames } from '@wildebeest/enums';
import {
  ConfiguredModelDefinition,
  ModelDefinition,
  ModelMap,
  StringKeys,
} from '@wildebeest/types';

/**
 * A MigrationLock db model
 */
export default class WildebeestModel<TModels extends ModelMap> extends Model {
  /** The sequelize model definition */
  public static definition: ModelDefinition<StringKeys<any>>;

  /** The configured sequelize model definition */
  public static configuredDefinition?: ConfiguredModelDefinition<
    StringKeys<any>
  >; // TODO set this

  /** The wildebeest configuration is added on the customInit setup */
  public static wildebeest?: Wildebeest<ModelMap>;

  /** The wildebeest sequelize database */
  public static db?: WildebeestDb<ModelMap>;

  /**
   * Setup all relattions for this model
   */
  public static createRelations<TInitModels extends ModelMap>(
    wildebeest: Wildebeest<TInitModels>,
    modelName: Extract<keyof TInitModels, string>,
  ): void {
    // TODO
    console.log(this.db);
  }

  /**
   * Wildebeest has a custom init function that also assigns wildebeest as an attribute on the class prototype
   *
   * @param model - The db model definition
   * @param wildebeest - The wildebeest instance
   * @returns Initializes the model
   */
  public static customInit<TInitModels extends ModelMap>(
    wildebeest: Wildebeest<TInitModels>,
    modelName: Extract<
      keyof TInitModels | keyof typeof DefaultTableNames,
      string
    >,
    tableName?: string,
  ): void {
    if (!this.definition) {
      throw new Error(
        `Model definition is not defined for model: "${this.name}". Attach as a static attributet`,
      );
    }

    // Call the sequelize init form the model definition
    WildebeestModel.init(this.definition.attributes || {}, {
      ...this.definition.options,
      modelName,
      tableName: tableName || this.definition.tableName,
      sequelize: wildebeest.db,
    });

    // Attach wildebeest to the class instance and class itself
    Object.defineProperty(WildebeestModel.prototype, 'wildebeest', {
      get: () => wildebeest,
    });
    Object.defineProperty(WildebeestModel.prototype, 'db', {
      get: () => wildebeest.db,
    });
    WildebeestModel.wildebeest = wildebeest;
    WildebeestModel.db = wildebeest.db;
  }

  /** Time the API key was created */
  public readonly createdAt!: Date;

  /** Time the API key was updated */
  public readonly updatedAt!: Date;

  /** The wildebeest configuration */
  public readonly wildebeest!: Wildebeest<TModels>;

  /** The wildebeest sequelize database */
  public db!: WildebeestDb<TModels>;
}
