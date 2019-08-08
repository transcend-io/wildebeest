/**
 *
 * ## Wildebeest Db Model
 * A database model definied for the wildebeest db management tooling
 *
 * @module models/Model
 * @see module:models
 */

// external modules
import { Model, ModelOptions, Op } from 'sequelize';
import { ModelHooks } from 'sequelize/types/lib/hooks';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { DefaultTableNames } from '@wildebeest/enums';
import {
  Associations,
  ConfiguredModelDefinition,
  ModelDefinition,
  ModelMap,
  StringKeys,
} from '@wildebeest/types';
import freshIndexes from '@wildebeest/utils/freshIndexes';
import getKeys from '@wildebeest/utils/getKeys';

/**
 * A MigrationLock db model
 */
export default class WildebeestModel<TModels extends ModelMap> extends Model {
  /** These values can be set as defaults for all models that extend this model */
  public static definitionDefaults: Partial<
    ModelDefinition<StringKeys<ModelMap>>
  > = {};

  /** The sequelize model definition */
  public static definition: ModelDefinition<StringKeys<ModelMap>>;

  /** Sequelize operators */
  public static Op: typeof Op = Op;

  /** The configured sequelize model definition */
  public static configuredDefinition?: ConfiguredModelDefinition<
    StringKeys<ModelMap>
  >; // TODO set this

  /** The wildebeest configuration is added on the customInit setup */
  public static wildebeest?: Wildebeest<ModelMap>;

  /** The wildebeest sequelize database */
  public static db?: WildebeestDb<ModelMap>;

  /**
   * Merge db model hooks
   *
   * @param defaultHooks - The default hooks
   * @param otherHooks - Additional hooks provided that should be merged
   * @returns The model options merged
   */
  public static mergeHooks(
    defaultHooks: Partial<ModelHooks> = {},
    otherHooks: Partial<ModelHooks> = {},
  ): Partial<ModelHooks> {
    // Copy the default hooks
    const copy = { ...defaultHooks } as any;

    // Loop over each of the other hooks
    getKeys(otherHooks).forEach((name) => {
      const hook = otherHooks[name] as any;

      // Set the hook when it does not exist
      if (!copy[name]) {
        copy[name] = hook;
      }

      // Merge the hooks
      const oldHook = copy[name];
      copy[name] = async (...args: any[]) => {
        // Call the old hook
        await Promise.resolve(oldHook(...args));
        // Call the new hook
        await Promise.resolve(hook(...args));
      };
    });

    return copy;
  }

  /**
   * Helper function to merge db model options with a default set. Only merges hooks and indexes
   *
   * @param defaultOptions - The default options
   * @param options - The options to override
   * @returns The combined model options
   */
  public static mergeOptions(
    defaultOptions: ModelOptions = {},
    otherOptions?: ModelOptions,
  ): ModelOptions {
    if (!otherOptions) {
      return freshIndexes(defaultOptions);
    }

    // Break up other options
    const { hooks, indexes, ...otherOpts } = otherOptions;

    // Result is simply a copy of default
    const result = { ...defaultOptions, ...otherOpts };

    // Apply new options
    result.hooks = WildebeestModel.mergeHooks(defaultOptions.hooks, hooks);
    result.indexes = [...(defaultOptions.indexes || []), ...(indexes || [])];

    return freshIndexes(result);
  }

  /**
   * Merge two association definitions
   *
   * @param defaultAssociations - The base set of associations
   * @param otherAssociations - The associations to merge
   * @returns The merged model associations
   */
  public static mergeAssociations(
    defaultAssociations: Associations = {},
    otherAssociations: Associations = {},
  ): Associations {
    // Clone the defaults
    const result = { ...defaultAssociations } as any;

    // Iterate over each associationType
    getKeys(otherAssociations).forEach((associationType) => {
      const associations = otherAssociations[associationType];
      // Create if does not exist
      if (!result[associationType]) {
        result[associationType] = associations;
      } else {
        // Merge if exists
        result[associationType] = {
          ...result[associationType],
          ...associations,
        };
      }
    });
    return result;
  }

  /**
   * Get the model definition by merging the default definition and definition
   */
  public static getDefinition(): ModelDefinition<StringKeys<ModelMap>> {
    return {
      // Definition overrides defaults
      ...this.definitionDefaults,
      ...this.definition,
      // Attributes are merged
      attributes: Object.assign(
        {},
        this.definitionDefaults.attributes,
        this.definition.attributes,
      ),
      defaultAttributes: Object.assign(
        {},
        this.definitionDefaults.defaultAttributes,
        this.definition.defaultAttributes,
      ),
      // associations and options are combined indiviudally
      associations: WildebeestModel.mergeAssociations(
        this.definitionDefaults.associations,
        this.definition.associations,
      ),
      options: WildebeestModel.mergeOptions(
        this.definitionDefaults.options,
        this.definition.options,
      ),
    };
  }

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

  /** Id is required */
  public readonly id?: any;

  /** The wildebeest configuration */
  public readonly wildebeest!: Wildebeest<TModels>;

  /** The wildebeest sequelize database */
  public db!: WildebeestDb<TModels>;
}
