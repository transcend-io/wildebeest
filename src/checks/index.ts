/**
 *
 * ## Sync Checks
 * Different tests that can be performed to check if sequelize definitions are in sync with the postgres db.
 *
 * @module checks
 */

// local
export { default as checkAllowNullConstraint } from './allowNullConstraint';
export { default as checkAssociationConfig } from './associationConfig';
export { default as checkAssociationsSync } from './associations';
export { default as checkColumnDefinition } from './columnDefinition';
export { default as checkColumnDefinitions } from './columnDefinitions';
export { default as checkColumnType } from './columnType';
export { default as checkDefaultValue } from './defaultValue';
export { default as checkEnumDefinition } from './enumDefinition';
export { default as checkExtraneousTables } from './extraneousTables';
export { default as checkModel } from './model';
export { default as checkIndexes } from './indexes';
export { default as checkPrimaryKeyDefinition } from './primaryKeyDefinition';
export { default as checkUniqueConstraint } from './uniqueConstraint';
