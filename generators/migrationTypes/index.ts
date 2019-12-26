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

/**
 * Types of migration generators
 */
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
