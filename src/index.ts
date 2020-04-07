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
import { CASCADE_HOOKS, NON_NULL } from './constants';
import * as utils from './utils';

// expose all migration types and classes
export * from './classes';
export * from './migrationTypes';

// Types
export * from './models';
export * from './mixins/types';
export * from './types';
export { default as Logger } from './Logger';
export const {
  createAssociationApply,
  createHooks,
  createAssociationApplyValue,
  createAttributes,
  escapeJson,
} = utils;
export {
  DataTypes,
  checks,
  utils,
  CASCADE_HOOKS,
  NON_NULL,
  Wildebeest,
  NamingConventions,
  WildebeestOptions,
};

// Default is wildebeest class
export default Wildebeest;
