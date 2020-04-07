/* tslint:disable completed-docs */
/**
 * Mixin prototypes to attach to each model instance in addition to the sequelize mixins
 */

// external
import pluralize from 'pluralize';
import { FindOptions } from 'sequelize';

// global
import { AssociationType } from '@wildebeest/enums';
import { AttributeInputs, MergedHookOptions } from '@wildebeest/types';
import { pascalCase } from '@wildebeest/utils';

// local
import { AnyModel } from './types';

/**
 * True if NODE_ENV=test
 */
export const { LOG_WHERE_ERR_VERBOSELY = false } = process.env;

/**
 * A db model prototype function. This is a function made available to a row on the db table
 */
export type PrototypeFunction = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * The db model prototype functions to attach to an instance of the class
 */
export type Prototypes = { [key in string]: PrototypeFunction };

/**
 * This instance
 */
type This = any;

/**
 * Mixin prototypes to attach to each model instance in addition to the sequelize mixins
 *
 * @param association - The association to create the hooks for
 * @param type - The type of association to create prototypes for
 * @param model - The name of the underlying model
 * @param throwClientError - The error to throw when no item is found (this can be provided as a specific client error type to modify)
 * @param pluralCase - A function to pluralize words
 * @returns The prototypes
 */
export default (
  association: string,
  type: AssociationType,
  model: string,
  throwClientError: (err: string) => never,
  pluralCase: (word: string) => string = pluralize,
): Prototypes => {
  // Determine casings to use
  const pascalAssociation = pascalCase(association);
  const pluralPascalAssociation = pluralCase(pascalAssociation);

  /**
   * Bulk create
   *
   * @param inputs - The inputs to create the model
   * @param allOptions - Options to pass to all instances when creating a model, to pass specific options, provider an options: {} attribute in the input
   * @returns The created models
   */
  function createMany<TInstance extends AnyModel>(
    this: This,
    inputs: AttributeInputs[],
    allOptions?: MergedHookOptions<TInstance, 'create'>,
  ): Promise<TInstance[]> {
    return Promise.all(
      inputs.map(({ options, ...item }) =>
        this[`create${pascalAssociation}`](item, { ...allOptions, options }),
      ),
    );
  }

  /**
   * Destroy all child instances with individual hooks
   *
   * @param options - The options to pass as the second arg
   * @returns The destroy promise
   */
  function destroyAll<TInstance extends AnyModel>(
    this: This,
    options?: MergedHookOptions<TInstance, 'destroy'>,
  ): Promise<void[]> {
    return this[`get${pluralPascalAssociation}`]().then((items: TInstance[]) =>
      Promise.all(items.map((item) => item.destroy(options))),
    );
  }

  /**
   * Find a single item and destroy it, if the item does not exist throw and error
   *
   * @param findOptions - Options for finding the instance
   * @param options - Options included in create
   * @returns True on success
   */
  function destroyOne<TInstance extends AnyModel>(
    this: This,
    findOptions: FindOptions,
    options?: MergedHookOptions<TInstance, 'destroy'>,
  ): Promise<boolean> {
    return this[`getOne${pascalAssociation}`](findOptions)
      .then((item: TInstance) => item.destroy(options))
      .then(() => true);
  }

  /**
   * Lookup the relationship and return the cached value if already looked up
   *
   * @param findOptions - Options for finding the instance
   * @returns The associated db model
   */
  function getCached<TInstance extends AnyModel>(
    this: This,
    findOptions?: FindOptions,
  ): Promise<TInstance> {
    // Return cache if it exists
    if (this[association]) {
      return Promise.resolve(this[association]);
    }

    // Get fresh
    return this[`get${pascalAssociation}`](findOptions).then(
      (result: TInstance) => {
        // Save for later
        this[association] = result;
        return result;
      },
    );
  }

  /**
   * Get the first item matching options and throws error if no matches
   *
   * @param findOptions - The options for querying the table
   * @param errorMessage - The error message to display on failure
   * @returns The first db model instance that matches the options
   */
  function getOne<TInstance extends AnyModel>(
    this: This,
    findOptions?: FindOptions,
    errorMessage = 'not found',
  ): Promise<TInstance> {
    return this[`get${pluralPascalAssociation}`](findOptions).then(
      ([item]: TInstance[]) => {
        // If no item found, throw an error
        if (!item) {
          const contents = !LOG_WHERE_ERR_VERBOSELY
            ? ''
            : `where: ${JSON.stringify(
                findOptions ? findOptions.where || {} : {},
              )}`;
          throwClientError(`${pascalAssociation} ${errorMessage}${contents}`);
          throw new Error(
            `DID NOT THROW CLIENT ERROR WHEN NO MODEL FOUND FOR s${pascalAssociation} ${errorMessage}`,
          );
        }
        return item;
      },
    );
  }

  /**
   * Get the association if it exists, else instantiate a new instance of the class with a default config
   *
   * @param defaultInput - Input for creating the the default model
   * @returns The connected instance of the default
   */
  async function getOrDefault<TInstance extends AnyModel>(
    this: This,
    defaultInput: AttributeInputs,
  ): Promise<TInstance> {
    // Return the child if it exists
    const child = await this[`get${pascalAssociation}`]();
    if (child) {
      return child;
    }

    // Create a new instance with the default input
    const ChildModel = this.db.model(model);
    return new ChildModel(defaultInput);
  }

  /**
   * Update all children of a model
   *
   * @param input - The input to update all models with
   * @param options - The options to pass as the second arg
   * @returns The updated instance
   */
  function updateAll<TInstance extends AnyModel>(
    this: This,
    input: TInstance,
    options?: MergedHookOptions<TInstance, 'update'>,
  ): Promise<TInstance[]> {
    return this[`get${pluralPascalAssociation}`]().then((items: TInstance[]) =>
      Promise.all(items.map((item) => item.update(input, options))),
    );
  }

  /**
   * Find a single child instance and update it, throw an error when not found
   *
   * @param findOptions - The options for finding the instance
   * @param input - Input to update the model with
   * @param options - Options to pass
   * @returns The updated instance
   */
  function updateOne<TInstance extends AnyModel>(
    this: This,
    findOptions: FindOptions,
    input: AttributeInputs,
    options?: MergedHookOptions<TInstance, 'update'>,
  ): Promise<TInstance> {
    return this[`getOne${pascalAssociation}`](
      findOptions,
    ).then((item: TInstance) => item.update(input, options));
  }

  /**
   * Lookup a child and update it, or create a new instance when not found
   *
   * @param findOptions - The options for finding the instance
   * @param input - Input for updating or creating the model
   * @param options - The options to pass as the second arg
   * @returns The updated or created instance
   */
  function updateOrCreate<TInstance extends AnyModel>(
    this: This,
    findOptions: FindOptions,
    input: AttributeInputs,
    options?: MergedHookOptions<TInstance, 'create'> &
      MergedHookOptions<TInstance, 'update'>,
  ): Promise<TInstance> {
    return this[`get${pluralPascalAssociation}`](findOptions).then(
      async ([item]: TInstance[]) => {
        // If no item found, create
        if (!item) {
          const created = await this[`create${pascalAssociation}`](
            input,
            options,
          );
          return Object.assign(created, { __wasCreated: true });
        }
        return item.update(
          input,
          options as MergedHookOptions<TInstance, 'update'>,
        );
      },
    );
  }

  /**
   * Lookup a belongsTo and update or create
   *
   * @param input - Input for updating or creating the model
   * @param options - The options to pass as the second arg
   * @returns The updated or created instance
   */
  function updateOrCreateOne<TInstance extends AnyModel>(
    this: This,
    input: AttributeInputs,
    options?: MergedHookOptions<TInstance, 'create'> &
      MergedHookOptions<TInstance, 'update'>,
  ): Promise<TInstance> {
    return this[`get${pascalAssociation}`]().then((item?: TInstance) => {
      // If no item found, create
      if (!item) {
        return this[`create${pascalAssociation}`](input, options);
      }
      return item.update(
        input,
        options as MergedHookOptions<TInstance, 'update'>,
      );
    });
  }

  // Determine which prototypes to attach
  return {
    [AssociationType.BelongsTo]: {
      [`getCached${pascalAssociation}`]: getCached,
      [`get${pascalAssociation}OrDefault`]: getOrDefault,
      [`updateOrCreate${pascalAssociation}`]: updateOrCreateOne,
    },
    [AssociationType.HasMany]: {
      [`createMany${pluralPascalAssociation}`]: createMany,
      [`destroyAll${pluralPascalAssociation}`]: destroyAll,
      [`destroyOne${pascalAssociation}`]: destroyOne,
      [`getOne${pascalAssociation}`]: getOne,
      [`updateAll${pluralPascalAssociation}`]: updateAll,
      [`updateOne${pascalAssociation}`]: updateOne,
      [`updateOrCreate${pascalAssociation}`]: updateOrCreate,
    },
    [AssociationType.HasOne]: {
      [`getCached${pascalAssociation}`]: getCached,
      [`get${pascalAssociation}OrDefault`]: getOrDefault,
      [`updateOrCreate${pascalAssociation}`]: updateOrCreateOne,
    },
    [AssociationType.BelongsToMany]: {},
  }[type];
};
