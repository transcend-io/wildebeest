/**
 *
 * ## Migration Attributes
 * Db model attributes for the migration model.
 *
 * @module migration/attributes
 * @see module:migration
 */

// external modules
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

/**
 * The id is an integer
 */
export const id: ModelAttributeColumnOptions = {
  autoIncrement: true,
  primaryKey: true,
  type: DataTypes.INTEGER,
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
 * The batch the migration was run in
 */
export const batch: ModelAttributeColumnOptions = {
  allowNull: true,
  type: DataTypes.INTEGER,
};

/**
 * The name of the migration that has been run
 */
export const name: ModelAttributeColumnOptions = {
  allowNull: false,
  type: DataTypes.STRING,
  unique: 'name must be unique',
};
