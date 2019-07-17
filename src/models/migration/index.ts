/**
 *
 * ## Migration Model
 * A database model for a Migration request.
 *
 * @module migration
 * @see module:migration/attributes
 * @see module:migration/options
 */

// local
import * as attributes from './attributes';
import Migration from './Migration';
import * as options from './options';

// Set the definition
Migration.definition = {
  attributes,
  options,
};

/**
 * A Migration db model
 */
export default Migration;
