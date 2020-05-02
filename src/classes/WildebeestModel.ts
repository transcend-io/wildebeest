/* eslint-disable-line max-lines */

// external
import * as Bluebird from 'bluebird';
import {
  FindOptions,
  Model as SequelizeModel,
  ModelOptions,
  Op,
  Order,
} from 'sequelize';
import { ModelHooks } from 'sequelize/types/lib/hooks';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { AssociationType } from '@wildebeest/enums';
import {
  Associations,
  BelongsToAssociation,
  ConfiguredModelDefinition,
  HasManyAssociation,
  HasOneAssociation,
  HookExtraOptions,
  ID,
  MergedHookOptions,
  ModelDefinition,
  SyncAssociationsIdentifiers,
  WildebeestModelName,
} from '@wildebeest/types';
import apply from '@wildebeest/utils/apply';
import configureModelDefinition from '@wildebeest/utils/configureModelDefinition';
import freshIndexes from '@wildebeest/utils/freshIndexes';
import getKeys from '@wildebeest/utils/getKeys';
import setAssociations from '@wildebeest/utils/setAssociations';

// mixins
import syncJoinAssociations from '@wildebeest/classes/helpers/syncJoinAssociations';
import { ONE_MINUTE, ONE_SECOND } from '@wildebeest/constants';
import mixins, { Prototypes } from '@wildebeest/mixins';
import { CustomWildebeestModelName } from '@wildebeest/models';

// /**
//  * Convert a model to JSON as best we can (overrides sequelize prototype)
//  * TODO make more accurate
//  */
// export type ModelToJson<M extends WildebeestModel> = Pick<
//   M,
//   {
//     // Exclude functions
//     [Key in keyof M]: M[Key] extends (...args: any[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any
//       ? never // Exclude non-model keys
//       : Key extends
//           | 'db'
//           | 'sequelize'
//           | 'wildebeest'
//           | 'isNewRecord'
//           | 'hookOptionsT'
//       ? never
//       : Key;
//   }[keyof M]
// >;

/**
 * Options for batch processing
 */
export type BatchProcessOptions = {
  /** Number of concurrent rows to process */
  concurrency?: number;
  /** Start the batch process after some time */
  timeout?: number;
  /** A log function */
  logChange?: (change: number) => string;
  /** Whether to log the time it took */
  logTime?: boolean;
};

/**
 * Convert a model to JSON as best we can (overrides sequelize prototype)
 * TODO make more accurate, wildebeest
 * TODO should apply toJSON on children models
 * TODO should filter out other non-model attributes
 */
export type SingleModelToJson<TModel extends WildebeestModel> = Pick<
  TModel,
  {
    // Exclude functions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in keyof TModel]: TModel[Key] extends (...args: any[]) => any
      ? never // Exclude non-model keys
      : Key extends
          | 'db'
          | 'sequelize'
          | 'wildebeest'
          | 'isNewRecord'
          | 'hookOptionsT'
      ? never
      : Key;
  }[keyof TModel]
>;

/**
 * Recursively convert model to JSON
 */
export type ModelToJson<TModel extends WildebeestModel> = {
  [k in keyof SingleModelToJson<TModel>]: SingleModelToJson<
    TModel
  >[k] extends WildebeestModel
    ? ModelToJson<SingleModelToJson<TModel>[k]>
    : SingleModelToJson<TModel>[k] extends (infer ModelT)[]
    ? ModelT extends WildebeestModel
      ? ModelToJson<ModelT>[]
      : SingleModelToJson<TModel>[k]
    : SingleModelToJson<TModel>[k];
};

/**
 * Decorator that enforces static types
 */
export type StaticTypeEnforcement<T> = <U extends T>(c: U) => void;

/**
 * A MigrationLock db model
 */
export default class WildebeestModel extends SequelizeModel {
  /** These values can be set as defaults for all models that extend this model */
  public static definitionDefaults: Partial<ModelDefinition> = {};

  /** The sequelize model definition */
  public static definition: ModelDefinition = {};

  /** The name of the db model, set after initialization */
  public static modelName: WildebeestModelName;

  /** The name of the table, set after initialization */
  public static tableName: string;

  /** Sequelize operators */
  public static Op: typeof Op = Op;

  /** The configured sequelize model definition */
  public static configuredDefinition?: ConfiguredModelDefinition; // TODO set this and use getters instead

  /** The wildebeest configuration is added on the customInit setup */
  public static wildebeest?: Wildebeest;

  /** The wildebeest sequelize database */
  public static db?: WildebeestDb;

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
  public static create<M extends WildebeestModel>(
    this: (new () => M) & typeof SequelizeModel,
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
   * TODO improve return type to use this
   *
   * @param this -This model
   * @param mergeDefaults - The defaults to merge with the existing defaults
   * @returns The merged default definitions
   */
  public static mergeDefaultDefinitions<
    TNewDefaults extends Partial<ModelDefinition<any>>, // StringKeys<ModelMap>
    TModel extends typeof WildebeestModel
  >(
    this: TModel,
    mergeDefaults: TNewDefaults,
  ): TNewDefaults & TModel['definitionDefaults'] {
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
    } as any;
  }

  /**
   * Get the model definition by merging the default definition and definition
   */
  public static getDefinition(): ModelDefinition {
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
  public static createMixinPrototypes(associations: Associations): Prototypes {
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
        | BelongsToAssociation<WildebeestModelName>
        | HasOneAssociation<WildebeestModelName>
        | HasManyAssociation<WildebeestModelName>,
      associationName: string,
    ) => Prototypes;

    // Get prototypes for an association
    const createPrototypes = (type: AssociationType): GetHelper => (
      association:
        | BelongsToAssociation<WildebeestModelName>
        | HasOneAssociation<WildebeestModelName>
        | HasManyAssociation<WildebeestModelName>,
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
  public static customInit(
    wildebeest: Wildebeest,
    modelName: WildebeestModelName | CustomWildebeestModelName,
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
    this.modelName = modelName as WildebeestModelName;
    this.tableName = tableName;

    // Configure the model definition
    const definition = this.getDefinition();
    this.configuredDefinition = configureModelDefinition(
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
  public readonly wildebeest!: Wildebeest;

  /** The wildebeest sequelize database */
  public db!: WildebeestDb;

  /** Indicator that the model was created and not updated TODO does sequelize already do this? */
  public __wasCreated?: true;

  /**
   * This is a helper function that will synchronize many-to-many associations when the instance is updated.
   * The update should provide the currently expected associations and the function will ensure that any extra existing associations will be destroyed and any missing associations will be added.
   *
   * @param this - Need to cast to do this to allow the inference to be the same as this model
   * @param modelOptions - The models to join upon
   * @param identifiers - The identifiers for which models to sync join public associations on
   * @returns The promise that will synchronize the join associations
   */
  public static async syncJoins<
    M extends WildebeestModel,
    TPrimaryModelName extends WildebeestModelName,
    TAssociationModelName extends WildebeestModelName
  >(
    this: (new () => M) &
      typeof WildebeestModel & {
        /** Name of the model */
        modelName: TPrimaryModelName;
      },
    modelOptions: {
      /** The name of the model being joined with */
      secondaryModel: TAssociationModelName;
      /** The name of the join model */
      joinModel?: WildebeestModelName;
    },
    identifiers: SyncAssociationsIdentifiers<
      TPrimaryModelName,
      TAssociationModelName
    >,
  ): Promise<void> {
    if (!this.wildebeest) {
      throw new Error(`Cannot call syncJoins until wildebeest is initialized`);
    }
    return syncJoinAssociations(
      this.wildebeest,
      { primaryModel: this.modelName, ...modelOptions },
      identifiers as any,
    );
  }

  /**
   * Loop over rows in a table in batches and process
   *
   * @param this - Need to cast to do this to allow the inference to be the same as this model
   * @param findOptions - There db get options
   * @param processRow - A function to process each row
   * @param options - When provided, will execute after a timeout and return immediately
   * @param logThreshold - Log whenever processing takes this long
   * @returns The number of rows that were processed
   */
  public static async batchProcess<M extends WildebeestModel>(
    this: (new () => M) & typeof WildebeestModel,
    findOptions: FindOptions = {},
    processRow: (row: M) => Promise<number>,
    options: BatchProcessOptions = {},
    logThreshold = ONE_MINUTE / 3,
  ): Promise<number> {
    if (!this.wildebeest) {
      throw new Error(
        `Cannot call batchProcess until wildebeest has been initialized`,
      );
    }
    const { logger } = this.wildebeest;

    // Get the db
    const {
      where = {},
      limit = 1000,
      order = [['createdAt', 'ASC']] as Order,
      ...rest
    } = findOptions;
    const {
      concurrency = 20,
      timeout = 0,
      logChange,
      logTime = true,
    } = options;

    // Determine the key to use to time the batch process
    const timerName = (loop = false): string =>
      `[batchProcess -- ${
        typeof logTime === 'string' ? logTime : this.tableName
      } -- ${loop ? 'loop' : 'result'}]`;

    // Run the batch processing
    let total = 0;
    const run = async (): Promise<number> => {
      let offset = 0;
      let remaining = true;
      let changed = 0;

      // Count the total number of rows
      const allRows = await this.count({
        where,
      });

      // Start the timer
      const t0 = new Date().getTime();

      // Log every logThreshold seconds
      let innerLogThreshold = logThreshold;

      // Loop over the table until all rows have been processed
      while (remaining) {
        /* eslint-disable no-await-in-loop */
        // Get the next batch of rows to process
        const rows = await this.findAll({
          ...rest,
          limit,
          offset,
          where,
          order,
        });

        // Process the rows
        const results = await Bluebird.default.map(rows as any, processRow, {
          concurrency,
        });

        // If we are logging the changed, then we assume this returns a list of numbers
        if (logChange) {
          changed += results.reduce((acc, next) => acc + next, 0);
        }

        // Keep track of the number of rows that were processed
        total += rows.length;

        // Update
        offset += limit;
        remaining = rows.length === limit;

        // Log when the processing takes a long time
        const interimTime = new Date().getTime() - t0;
        if (interimTime > innerLogThreshold) {
          innerLogThreshold += logThreshold;
          logger.info(
            `${timerName(true)}: Processed "${total}/${allRows}" rows in "${
              interimTime / ONE_SECOND
            }" seconds`,
          );
        }
      } /* eslint-enable no-await-in-loop */

      // Log the change
      if (logChange && changed) {
        logger.info(logChange(changed));
      }

      const t1 = new Date().getTime();
      const totalTime = t1 - t0;

      // Log when the processing takes a long time
      if (logTime || totalTime > logThreshold) {
        logger.success(
          `${timerName()}: Processed "${total}" rows in "${
            totalTime / ONE_SECOND
          }" seconds`,
        );
      }

      // The number of rows that were affected
      return total;
    };

    // Execute after some time but return for now
    if (timeout) {
      setTimeout(run, timeout);
      return total;
    }

    // Run sync
    return run();
  }

  /**
   * Updates or creates an entry depending on if one is found matching input options
   * TODO: Type this better, move to Wildebeest
   *
   * @param this - The model itself
   * @param findOptions - Options used to search for finding an entry
   * @param updateOrCreateOptions - Options used to create an entry if not found
   * @returns The updated or created entry
   */
  public static async updateOrCreate<M extends WildebeestModel>(
    this: typeof WildebeestModel & (new () => M),
    findOptions: FindOptions,
    updateOrCreateOptions: any,
  ): Promise<M> {
    const entry = await this.findOne(findOptions);
    if (entry) {
      return entry.update(updateOrCreateOptions) as any;
    }
    return this.create(updateOrCreateOptions) as any;
  }

  /**
   * Gets and counts desired model instances and converts them according to the mapper function
   *
   * @param this - This model
   * @param options - Options to filter for the desired model instances
   * @param mapper - Convert row model instances to instances of type TResult
   * @returns The count and rows
   */
  public static async getAndCount<M extends WildebeestModel, TResult>(
    this: (new () => M) & typeof WildebeestModel,
    options: FindOptions,
    mapper: (instance: M) => TResult | Promise<TResult>,
  ): Promise<{
    /** The total number of matching rows */
    count: number;
    /** The processed (limit) rows returned */
    rows: TResult[];
  }> {
    const { count, rows } = await this.findAndCountAll<M>(options);
    return {
      count,
      rows: await Promise.all(rows.map(mapper)),
    };
  }

  /** Input for creating a new model TODO */
  public modelInputT!: {};

  /**
   * Get the db model name from an instance TODO wildebeest?
   *
   * @returns The model name
   */
  public get modelName(): this['id'] extends ID<infer TModelName>
    ? TModelName
    : string {
    // TODO return type more robust than using ID AKA primaryEmail?
    return (this.constructor as typeof WildebeestModel).modelName as any;
  }

  /**
   * Override to JSON to be current attributes  TODO wildebeest?
   *
   * @param this - This model instance
   * @returns This model as a JSON object, with an override to be typed
   */
  public toJSON<M extends WildebeestModel>(this: M): ModelToJson<M> {
    return super.toJSON() as ModelToJson<M>;
  }

  /**
   * Override update to include special options  TODO wildebeest?
   *
   * @param this - This model instance
   * @param keys - The keys to update
   * @param options - Additional options
   * @returns This model as a JSON object, with an override to be typed
   */
  public update<M extends WildebeestModel>(
    this: M & SequelizeModel,
    keys: object,
    options?: MergedHookOptions<M, 'update'>,
  ): Bluebird<this> {
    return super.update(keys, options);
  }

  /**
   * Override destroy to include special options  TODO wildebeest?
   *
   * @param this - This model instance
   * @param options - Destroy options
   * @returns This model as a JSON object, with an override to be typed
   */
  public destroy<M extends WildebeestModel>(
    this: M & SequelizeModel,
    options?: MergedHookOptions<M, 'destroy'>,
  ): Bluebird<void> {
    return super.destroy(options);
  }
}
