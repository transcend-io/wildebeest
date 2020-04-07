// external
import { DataTypes } from 'sequelize';

// global
import createAttributes from '@wildebeest/utils/createAttributes';

/**
 * Attribute definitions for the model
 */
const attributes = createAttributes({
  /** Indicates that the migrator should be locked because another instance is running the migrations. */
  isLocked: {
    allowNull: false,
    defaultValue: false,
    type: DataTypes.BOOLEAN,
    unique: 'isLocked must be unique',
  },
});

// Model definition
export default {
  attributes,
  tableName: 'migrationLocks',
};
