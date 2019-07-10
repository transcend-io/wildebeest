/**
 *
 * ## TableAssociationColumn Migration Type
 * A higher order generator that creates a Table association column migrator.
 *
 * A migrator for table column that is an association
 *
 * @module tableAssociationColumn
 * @see module:tableAssociationColumn/lib
 * @see module:tableAssociationColumn/prompts
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'tableMigration',
  prompts,
};
