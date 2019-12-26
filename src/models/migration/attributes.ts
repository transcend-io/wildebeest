// external modules
import { DataTypes } from 'sequelize';

// global
import createAttributes from '@wildebeest/utils/createAttributes';

/**
 * Attribute definitions for the model
 */
const ATTRIBUTES = createAttributes({
  /** The id is an integer */
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  /** The batch the migration was run in */
  batch: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  /** The name of the migration that has been run */
  name: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: 'name must be unique',
  },
});
export default ATTRIBUTES;
