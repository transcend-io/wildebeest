// local
import addCascadeWithParent from './addCascadeWithParent';
import addColumns from './addColumns';
import addEnumValues from './addEnumValues';
import addIndex from './addIndex';
import addUniqueConstraintIndex from './addUniqueConstraintIndex';
import bulkDelete from './bulkDelete';
import bulkInsert from './bulkInsert';
import cascadeWithParent from './cascadeWithParent';
import changeColumn from './changeColumn';
import changeEnumColumn from './changeEnumColumn';
import changeOnDelete from './changeOnDelete';
import createTable from './createTable';
import custom from './custom';
import dropTable from './dropTable';
import makeColumnAllowNull from './makeColumnAllowNull';
import makeColumnNonNull from './makeColumnNonNull';
import makeColumnUnique from './makeColumnUnique';
import removeColumns from './removeColumns';
import removeEnumValues from './removeEnumValues';
import removeIndex from './removeIndex';
import removeNonNullColumn from './removeNonNullColumn';
import removeUniqueConstraintIndex from './removeUniqueConstraintIndex';
import renameEnumValue from './rename-enum-value';
import renameColumn from './renameColumn';
import renameConstraint from './renameConstraint';
import renameEnum from './renameEnum';
import renameIndex from './renameIndex';
import renameS3Files from './renameS3Files';
import renameTable from './renameTable';
import uuidNonNull from './uuidNonNull';

/**
 * Migration generators
 */
export default {
  addCascadeWithParent,
  addColumns,
  addEnumValues,
  addIndex,
  addUniqueConstraintIndex,
  bulkDelete,
  bulkInsert,
  cascadeWithParent,
  changeColumn,
  changeEnumColumn,
  changeOnDelete,
  createTable,
  custom,
  dropTable,
  makeColumnAllowNull,
  makeColumnNonNull,
  makeColumnUnique,
  removeColumns,
  removeEnumValues,
  removeIndex,
  removeNonNullColumn,
  removeUniqueConstraintIndex,
  renameColumn,
  renameConstraint,
  renameEnum,
  renameEnumValue,
  renameIndex,
  renameS3Files,
  renameTable,
  uuidNonNull,
};
