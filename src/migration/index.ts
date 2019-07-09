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
 * @see module:migration/prototypes
 * @see module:migration/regexes
 * @see module:migration/types
 */

// db
import { createdAt, updatedAt } from '@bk/db/attributes';

// local
import * as attributes from './attributes';
import * as constants from './constants';
import * as methods from './methods';
import * as options from './options';
import * as prototypes from './prototypes';
import * as regexes from './regexes';

export { attributes, constants, methods, options, prototypes, regexes };

/**
 * Default attributes
 */
export const defaultAttributes = { createdAt, updatedAt };
