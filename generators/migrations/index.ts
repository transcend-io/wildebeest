/**
 *
 * ## Migrations
 * Migration generators
 *
 * @module migrations
 * @see module:addCascadeWithParent
 * @see module:addColumns
 * @see module:addEnumValues
 * @see module:addIndex
 * @see module:addUniqueConstraintIndex
 * @see module:bulkDelete
 * @see module:bulkInsert
 * @see module:cascadeWithParent
 * @see module:changeColumn
 * @see module:changeEnumColumn
 * @see module:changeOnDelete
 * @see module:createTable
 * @see module:custom
 * @see module:dropTable
 * @see module:makeColumnAllowNull
 * @see module:makeColumnNonNull
 * @see module:makeColumnUnique
 * @see module:removeColumns
 * @see module:removeEnumValues
 * @see module:removeIndex
 * @see module:removeNonNullColumn
 * @see module:removeUniqueConstraintIndex
 * @see module:rename-enum-value
 * @see module:renameColumn
 * @see module:renameConstraint
 * @see module:renameEnum
 * @see module:renameIndex
 * @see module:renameS3Files
 * @see module:renameTable
 * @see module:uuidNonNull
 */

// local
const addCascadeWithParent = require('./addCascadeWithParent');
const addColumns = require('./addColumns');
const addEnumValues = require('./addEnumValues');
const addIndex = require('./addIndex');
const addUniqueConstraintIndex = require('./addUniqueConstraintIndex');
const bulkDelete = require('./bulkDelete');
const bulkInsert = require('./bulkInsert');
const cascadeWithParent = require('./cascadeWithParent');
const changeColumn = require('./changeColumn');
const changeEnumColumn = require('./changeEnumColumn');
const changeOnDelete = require('./changeOnDelete');
const createTable = require('./createTable');
const custom = require('./custom');
const dropTable = require('./dropTable');
const makeColumnAllowNull = require('./makeColumnAllowNull');
const makeColumnNonNull = require('./makeColumnNonNull');
const makeColumnUnique = require('./makeColumnUnique');
const removeColumns = require('./removeColumns');
const removeEnumValues = require('./removeEnumValues');
const removeIndex = require('./removeIndex');
const removeNonNullColumn = require('./removeNonNullColumn');
const removeUniqueConstraintIndex = require('./removeUniqueConstraintIndex');
const renameEnumValue = require('./rename-enum-value');
const renameColumn = require('./renameColumn');
const renameConstraint = require('./renameConstraint');
const renameEnum = require('./renameEnum');
const renameIndex = require('./renameIndex');
const renameS3Files = require('./renameS3Files');
const renameTable = require('./renameTable');
const uuidNonNull = require('./uuidNonNull');

module.exports = {
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
