/**
 *
 * ## Seed Type Definitions
 * Typescript type definitions for mixins
 *
 * @module mixins/types
 * @see module:mixins
 */

// local
import ChangeCase from './ChangeCase';

/**
 * A type of association
 */
export enum AssociationType {
  /** Belongs to add id to col */
  BelongsTo = 'belongsTo',
  /** Join */
  BelongsToMany = 'belongsToMany',
  /** Has many */
  HasMany = 'hasMany',
  /** Has one */
  HasOne = 'hasOne',
}

/**
 * Casing inputs needed to define the attributes
 */
export type MixinAttributeInput = {
  /** The name of the model being associated */
  modelName: ChangeCase;
  /** The name of the association (the `as` or the `modelName`) */
  associationName: ChangeCase;
  /** The name of the primary ket joining the tables */
  primaryKeyName: string;
  /** The name of the model that the association is being made through */
  throughModelName?: string;
};

/**
 * The input to the handlebars template
 */
export type MixinAttributes = {
  /** The fully compiled attribute definition */
  attribute: string;
};

/**
 * Mixin definitions to be injected onto a class
 */
export type AssociationMixins = {
  [k in AssociationType]: (input: MixinAttributeInput) => MixinAttributes[];
};

/**
 * An object keyed by strings
 */
export type ObjByString = { [key in string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Extract string keys from an object
 */
export type StringKeys<TObj extends ObjByString> = Extract<keyof TObj, string>;

/**
 * The information needed to generate mixins for the association definition
 */
export type AssociationDefinition = {
  /** The name of the model */
  modelName: string;
  /** The name of the primary key that is creating the join */
  primaryKeyName: string;
  /** The name of the through model */
  throughModelName?: string;
};

/**
 * Mapping of association definitions
 */
export type AssociationsMapping = {
  [k in AssociationType]: { [k in string]: AssociationDefinition };
};

/**
 * Association definitions for a model
 */
export type AssociationsDefinition = {
  /** The full path to the associations */
  filePath: string;
  /** The relative path to the associations from the root Path */
  relativePath: string;
  /** Documentation for the associations definition */
  documentation: string;
  /** The association definitions */
  associations: AssociationsMapping;
};

/**
 * Configuration for generating mixins
 */
export type GenerateMixinsConfig = {
  /** The path to the root of the project */
  rootPath: string;
  /** The path to the src file to be required that will eventually require all association definitions (typically root of project of model definitions) */
  src: string;
  /** The import path where all model definitions can be found */
  modelDefinitionsPath: string;
  /** Can specify custom mixins attributes to inject as well */
  getCustomMixinAttributes?: Partial<AssociationMixins>;
  /** A function to pluralize words */
  pluralCase?: (word: string) => string;
  /** Inverse of pluralCase */
  singularCase?: (word: string) => string;
  /** The name of the file where association definitions are found */
  associationFileName?: string;
  /** The name of the file to generate the base documentation */
  baseFileName?: string;
  /** The name of constant in the `associationFileName` files that encodes the type of the associations */
  associationDefinitionName?: string;
  /** Optionally provide path to tsconfig if not <rootPath>/tsconfig.json */
  tsConfigPath?: string;
  /** The path to the handlebars model that is used to generate the base model class definition */
  baseModelTemplatePath?: string;
  /** A function that will determine the base model to be extended */
  determineModelToExtend?: (
    associationsDefinition: AssociationsDefinition,
    config: Required<GenerateMixinsConfig>,
  ) => Omit<BaseFileInput, 'sections'>;
  /** Helper functions to add to the handlebars template */
  handlebarsHelpers?: { [k in string]: (...args: any[]) => string };
};

/**
 * An association input definition
 */
export type AssociationInput = {
  /** The name of the primary key column that joins the association */
  primaryKeyName: string;
  /** The association name */
  associationName: string;
  /** The name of the through model */
  throughModelName?: string;
  /** The name of the model */
  modelName: string;
  /** The compiled attribute definitions to inject */
  attributes: MixinAttributes[];
};

/**
 * A section of associations
 */
export type AssociationSection = {
  /** The association section */
  associationType: AssociationType;
  /** The association definitions in the section */
  definitions: AssociationInput[];
};

/**
 * Input for handlebars function to generate the base file
 */
export type BaseFileInput = {
  /** The container to create the base for */
  container: string;
  /** The import path where all model definitions can be found */
  modelDefinitionsPath: string;
  /** The name of the model that will be the extended by the base */
  ModelBaseName: string;
  /** The folder in which the model is imported from */
  modelBaseFolder: string;
  /** The association sections to render */
  sections: AssociationSection[];
};
