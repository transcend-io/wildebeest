/**
 *
 * ## MigrationLock Attributes
 * Db model attributes for the migrationLock model.
 *
 * @module migrationLock/attributes
 */

// external modules
import { DataTypes } from 'sequelize';

// global
import createAttributes from '@wildebeest/utils/createAttributes';

/**
 * Attribute definitions for the model
 */
const ATTRIBUTES = createAttributes({
  /** Indicates that the migrator should be locked because another instance is running the migrations. */
  isLocked: {
    allowNull: false,
    defaultValue: false,
    type: DataTypes.BOOLEAN,
    unique: 'isLocked must be unique',
  },
});
export default ATTRIBUTES;
