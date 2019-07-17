/**
 *
 * ## MigrationLock Model
 * A database model for a MigrationLock request.
 *
 * @module migrationLock
 * @see module:migrationLock/attributes
 */

// local
import * as attributes from './attributes';
import MigrationLock from './MigrationLock';

// Set the definition
MigrationLock.definition = {
  attributes,
};

/**
 * A MigrationLock db model
 */
export default MigrationLock;
