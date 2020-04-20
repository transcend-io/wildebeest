/* eslint-disable-line max-lines */

// external
import * as Bluebird from 'bluebird';
import { Model, ModelOptions, Op } from 'sequelize';
import { ModelHooks } from 'sequelize/types/lib/hooks';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { AssociationType, DefaultTableNames } from '@wildebeest/enums';
import {
  Associations,
  BelongsToAssociation,
  ConfiguredModelDefinition,
  HasManyAssociation,
  HasOneAssociation,
  HookExtraOptions,
  MergedHookOptions,
  ModelDefinition,
  ModelMap,
  StringKeys,
} from '@wildebeest/types';
import apply from '@wildebeest/utils/apply';
import configureModelDefinition from '@wildebeest/utils/configureModelDefinition';
import freshIndexes from '@wildebeest/utils/freshIndexes';
import getKeys from '@wildebeest/utils/getKeys';
import setAssociations from '@wildebeest/utils/setAssociations';

// mixins
import mixins, { Prototypes } from '@wildebeest/mixins';

/**
 * Convert a model to JSON as best we can (overrides sequelize prototype)
 * TODO make more accurate
 */
export type ModelToJson<M extends WildebeestModel<any>> = Pick<
  M,
  {
    // Exclude functions
    [Key in keyof M]: M[Key] extends (...args: any[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any
      ? never // Exclude non-model keys
      : Key extends
          | 'db'
          | 'sequelize'
          | 'wildebeest'
          | 'isNewRecord'
          | 'hookOptionsT'
      ? never
      : Key;
  }[keyof M]
>;

/**
 * Decorator that enforces static types
 */
export type StaticTypeEnforcement<T> = <U extends T>(c: U) => void;

/**
 * A MigrationLock db model
 */
export default class WildebeestModel<TModels extends ModelMap> extends Model {
  /** These values can be set as defaults for all models that extend this model */
  public static definitionDefaults: Partial<
    ModelDefinition<StringKeys<ModelMap>>
  > = {};

  /** The sequelize model definition */
  public static definition: ModelDefinition<StringKeys<ModelMap>> = {};

  /** The name of the db model, set after initialization */
  public static modelName: string;

  /** The name of the table, set after initialization */
  public static tableName: string;

  /** Sequelize operators */
  public static Op: typeof Op = Op;

  /** The configured sequelize model definition */
  public static configuredDefinition?: ConfiguredModelDefinition<
    StringKeys<ModelMap>
  >; // TODO set this and use getters instead

  /** The wildebeest configuration is added on the customInit setup */
  public static wildebeest?: Wildebeest<ModelMap>;

  /** The wildebeest sequelize database */
  public static db?: any;

  /**
   * A decorator that can be used to enforce static type definitions
   *
   * @returns A decorator that will type-enforce the class constructor
   */
  public static statics<T>(): StaticTypeEnforcement<T> {
    return <U extends T>(constructor: U) => {
      constructor; /* eslint-disable-line no-unused-expressions */
    };
  }

  /**
   * Builds a new model instance and calls save on it.
   */
  public static create<M extends WildebeestModel<any>>(
    this: (new () => M) & typeof Model,
    values: object,
    options?: MergedHookOptions<M, 'create'>,
  ): Bluebird<M> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return super.create(values, options);
  }

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
      } else {
        // Merge the hooks
        const oldHook = copy[name];
        copy[name] = async (...args: any[]) => {
          // Call the old hook
          await Promise.resolve(oldHook(...args));
          // Call the new hook
          await Promise.resolve(hook(...args));
        };
      }
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
   *
   * @param this -This model
   * @param mergeDefaults - The defaults to merge with the existing defaults
   * @returns The merged default definitions
   */
  public static mergeDefaultDefinitions<
    TNewDefaults extends Partial<ModelDefinition<any>>,
    M extends typeof WildebeestModel
  >(
    this: M,
    mergeDefaults: TNewDefaults,
  ): TNewDefaults & M['definitionDefaults'] {
    if (!this.definitionDefaults) {
      this.definitionDefaults = {};
    }

    return {
      // Definition overrides defaults
      ...this.definitionDefaults,
      ...mergeDefaults,
      // Attributes are merged
      attributes: {
        ...this.definitionDefaults.attributes,
        ...mergeDefaults.attributes,
      },
      ...(this.definitionDefaults.defaultAttributes ||
      mergeDefaults.defaultAttributes
        ? {
            defaultAttributes: {
              ...this.definitionDefaults.defaultAttributes,
              ...mergeDefaults.defaultAttributes,
            },
          }
        : {}),
      // associations and options are combined individually
      associations: WildebeestModel.mergeAssociations(
        this.definitionDefaults.associations,
        mergeDefaults.associations,
      ),
      options: WildebeestModel.mergeOptions(
        this.definitionDefaults.options,
        mergeDefaults.options,
      ),
    };
  }

  /**
   * Get the model definition by merging the default definition and definition
   */
  public static getDefinition(): ModelDefinition<StringKeys<ModelMap>> {
    return this.mergeDefaultDefinitions(this.definition);
  }

  /**
   * Setup all relations for this model
   */
  public static createRelations(): void {
    setAssociations(this);
  }

  /**
   * Get prototype helper methods not supplied by sequelize
   *
   * @param associations - The associations to generate mixins for
   * @returns The prototypes to inject onto the model
   */
  public static createMixinPrototypes(
    associations: Associations<string>,
  ): Prototypes {
    // Ensure wildebeest is defined
    const { wildebeest } = this;
    if (!wildebeest) {
      throw new Error(
        `Must initialize with wildebeest before calling "getAssociationPrototypes`,
      );
    }

    /** Helper function for constructing prototypes */
    type GetHelper = (
      association:
        | BelongsToAssociation<string>
        | HasOneAssociation<string>
        | HasManyAssociation<string>,
      associationName: string,
    ) => Prototypes;

    // Get prototypes for an association
    const createPrototypes = (type: AssociationType): GetHelper => (
      association:
        | BelongsToAssociation<string>
        | HasOneAssociation<string>
        | HasManyAssociation<string>,
      associationName: string,
    ): Prototypes =>
      mixins(
        associationName,
        type,
        typeof association === 'string'
          ? associationName
          : association.modelName || associationName,
        wildebeest.throwClientError,
        wildebeest.pluralCase,
      );

    // Additional prototypes to attach for quick access to associations
    return Object.assign(
      {},
      ...Object.values(
        apply(
          associations.hasMany || {},
          createPrototypes(AssociationType.HasMany),
        ),
      ),
      ...Object.values(
        apply(
          associations.hasOne || {},
          createPrototypes(AssociationType.HasOne),
        ),
      ),
      ...Object.values(
        apply(
          associations.belongsTo || {},
          createPrototypes(AssociationType.BelongsTo),
        ),
      ),
    );
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
    tableName: string,
  ): void {
    if (!this.definition) {
      throw new Error(
        `Model definition is not defined for model: "${this.name}". Attach as a static attribute`,
      );
    }

    // save definitions
    this.wildebeest = wildebeest;
    this.db = wildebeest.db;
    this.modelName = modelName;
    this.tableName = tableName;

    // Configure the model definition
    const definition = this.getDefinition();
    this.configuredDefinition = configureModelDefinition<ModelMap>(
      wildebeest,
      modelName,
      definition,
    );

    // Call the sequelize init form the model definition
    this.init(this.configuredDefinition.attributes, {
      name: {
        singular: modelName,
        plural: wildebeest.pluralCase(modelName),
      },
      ...this.configuredDefinition.options,
      modelName,
      tableName: tableName || this.configuredDefinition.tableName,
      sequelize: wildebeest.db,
    });

    // Attach wildebeest to the class instance and class itself
    Object.defineProperty(this.prototype, 'wildebeest', {
      get: () => wildebeest,
    });
    Object.defineProperty(this.prototype, 'db', {
      get: () => wildebeest.db,
    });

    // Define additional mixins
    Object.assign(
      this.prototype,
      this.createMixinPrototypes(
        this.configuredDefinition.rawAssociations || {},
      ),
    );
  }

  /**
   * A type can be provided for the specific hook options outside of the default sequelize ones
   */
  public hookOptionsT!: HookExtraOptions;

  /** Time the API key was created TODO maybe not here */
  public readonly createdAt!: Date;

  /** Time the API key was updated TODO maybe not here */
  public readonly updatedAt!: Date;

  /** Id is required TODO */
  public readonly id?: unknown;

  /** The wildebeest configuration */
  public readonly wildebeest!: Wildebeest<TModels>;

  /** The wildebeest sequelize database */
  public db!: WildebeestDb<TModels>;

  /** Indicator that the model was created and not updated TODO does sequelize already do this? */
  public __wasCreated?: true;
}
