/**
 *
 * ## DB Migrations
 * Migration files for migrating the db using Sequelize and Umzug
 *
 * @module wildebeest
 */

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
export * from './mixins';
export * from './types';
export const { createAssociations } = utils;
export { default as Logger } from './Logger';
export {
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
