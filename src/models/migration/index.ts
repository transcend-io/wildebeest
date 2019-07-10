/**
 *
 * ## Migration
 * The migrations that have been run.
 *
 * @class Migration
 * @module migration
 * @see module:migration/attributes
 * @see module:migration/constants
 * @see module:migration/lib
 * @see module:migration/methods
 * @see module:migration/options
 * @see module:migration/regexes
 * @see module:migration/types
 */

// local
import * as attributes from './attributes';
import * as constants from './constants';
import * as options from './options';
import * as regexes from './regexes';

export { attributes, constants, options, regexes };
export { default } from './Migration';
