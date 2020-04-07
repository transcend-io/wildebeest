// external
import { DataTypes } from 'sequelize';

// global
import createAttributes from '@wildebeest/utils/createAttributes';

// local
import hooks from './hooks';

/**
 * Attribute definitions for the model
 */
const attributes = createAttributes({
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

// Model definition
export default {
  attributes,
  options: { hooks },
  tableName: 'migrations',
};
