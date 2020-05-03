/**
 * Migration files for migrating the db using Sequelize and Umzug
 */

// external
import { DataTypes } from 'sequelize';

// local
import * as checks from './checks';
import Wildebeest, {
  NamingConventions,
  WildebeestOptions,
} from './classes/Wildebeest';
import { ModelToJson } from './classes/WildebeestModel';
import { CASCADE_HOOKS, NON_NULL } from './constants';

export { default as models } from './models';

// Helpers
export {
  addTableColumns,
  removeTableColumns,
} from './migrationTypes/addColumns';
export {
  addValuesToEnum,
  removeValuesFromEnum,
} from './migrationTypes/addEnumValues';
export { changeDefaultValue } from './migrationTypes/changeColumnDefault';
export { changeConstraintOnDelete } from './migrationTypes/changeOnDelete';
export { createNewTable, dropTable } from './migrationTypes/createTable';

// expose all migration types and classes
export * from './classes';
export * from './migrationTypes';

// Types
export * from './utils';
export * from './mixins/types';
export * from './types';
export { default as Logger } from './Logger';
export {
  DataTypes,
  checks,
  CASCADE_HOOKS,
  NON_NULL,
  Wildebeest,
  NamingConventions,
  WildebeestOptions,
  ModelToJson,
};

// Default is wildebeest class
export default Wildebeest;
