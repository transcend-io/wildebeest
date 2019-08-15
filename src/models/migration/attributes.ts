/**
 *
 * ## Migration Attributes
 * Db model attributes for the migration model.
 *
 * @module migration/attributes
 * @see module:migration
 */

// external modules
import { DataTypes } from 'sequelize';

// global
import createAttributes from '@wildebeest/utils/createAttributes';
import { ExtractUpdateAttributes } from '../../utils/updateRows';

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
  /** Created at time */
  createdAt: {
    allowNull: false,
    defaultValue: () => new Date(),
    type: DataTypes.DATE,
  },
  /** Updated at time */
  updatedAt: {
    allowNull: false,
    defaultValue: () => new Date(),
    type: DataTypes.DATE,
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

type tTTTTTT = ExtractUpdateAttributes<typeof ATTRIBUTES>;
