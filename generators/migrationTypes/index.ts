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
const alterEnum = require('./alterEnum');
const changeEnumAttributes = require('./changeEnumAttributes');
const dbMigration = require('./dbMigration');
const tableAssociationColumn = require('./tableAssociationColumn');
const tableColumnMigration = require('./tableColumnMigration');
const tableColumnsMigration = require('./tableColumnsMigration');
const tableMigration = require('./tableMigration');
const tablesColumnMigration = require('./tablesColumnMigration');
const tablesMigration = require('./tablesMigration');

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
