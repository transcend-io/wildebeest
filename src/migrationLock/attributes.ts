/**
 *
 * ## MigrationLock Attributes
 * Db model attributes for the migrationLock model.
 *
 * @module migrationLock/attributes
 * @see module:migrationLock
 */

// external modules
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

/**
 * Indicates that the migrator should be locked because another instance is running the migrations.
 */
export const isLocked: ModelAttributeColumnOptions = {
  allowNull: false,
  defaultValue: false,
  type: DataTypes.BOOLEAN,
  unique: 'isLocked must be unique',
};
