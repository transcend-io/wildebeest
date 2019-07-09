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
 * A uniquely identifying and random id
 */
export const id: ModelAttributeColumnOptions = {
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
  type: DataTypes.UUID,
};

/**
 * Created at time
 */
export const createdAt: ModelAttributeColumnOptions = {
  allowNull: false,
  defaultValue: () => new Date(),
  type: DataTypes.DATE,
};

/**
 * Updated at time
 */
export const updatedAt: ModelAttributeColumnOptions = {
  allowNull: false,
  defaultValue: () => new Date(),
  type: DataTypes.DATE,
};

/**
 * Indicates that the migrator should be locked because another instance is running the migrations.
 */
export const isLocked: ModelAttributeColumnOptions = {
  allowNull: false,
  defaultValue: false,
  type: DataTypes.BOOLEAN,
  unique: 'isLocked must be unique',
};
