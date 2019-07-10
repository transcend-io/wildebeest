/**
 *
 * ## DB Migrations
 * Migration files for migrating the db using Sequelize and Umzug
 *
 * @module wildebeest
 */

// local
import * as checks from './checks';
import { CASCADE_HOOKS, NON_NULL } from './constants';
import * as utils from './utils';
import Wildebeest, { NamingConventions, WildebeestOptions } from './Wildebeest';

// expose all migration types
export * from './migrationTypes';

// Types
export * from './models';
export * from './types';
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
