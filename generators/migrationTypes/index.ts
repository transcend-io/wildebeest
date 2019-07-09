/**
 *
 * ## Migration Types
 * Types of migration generators
 *
 * @module migrationTypes
 * @see module:alterEnum
 * @see module:changeEnumAttributes
 * @see module:dbMigration
 * @see module:tableAssociationColumn
 * @see module:tableColumnMigration
 * @see module:tableColumnsMigration
 * @see module:tableMigration
 * @see module:tablesColumnMigration
 * @see module:tablesMigration
 */

// local
import alterEnum from './alterEnum';
import changeEnumAttributes from './changeEnumAttributes';
import dbMigration from './dbMigration';
import tableAssociationColumn from './tableAssociationColumn';
import tableColumnMigration from './tableColumnMigration';
import tableColumnsMigration from './tableColumnsMigration';
import tableMigration from './tableMigration';
import tablesColumnMigration from './tablesColumnMigration';
import tablesMigration from './tablesMigration';

module.exports = {
  alterEnum,
  changeEnumAttributes,
  dbMigration,
  tableAssociationColumn,
  tableColumnMigration,
  tableColumnsMigration,
  tableMigration,
  tablesColumnMigration,
  tablesMigration,
};
