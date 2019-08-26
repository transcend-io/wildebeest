/**
 *
 * ## Migration Types
 * Types of migration generators
 *
 * @module migrationTypes
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

export default {
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
