// external modules
import * as sequelize from 'sequelize';

// global
import { Association } from '@wildebeest/types';

/**
 * Get the attribute definition for an association column
 *
 * @memberof module:utils
 *
 * @param association - The association config
 * @param config - The attribute config of the column to join on
 * @returns The association attribute definition
 */
export default function getAssociationAttribute<TModelName extends string>(
  association: Association<TModelName>,
  config: sequelize.ModelAttributeColumnOptions = {
    defaultValue: sequelize.UUIDV4,
    type: sequelize.UUID,
  },
): sequelize.ModelAttributeColumnOptions {
  // We do not copy over some values
  const { primaryKey, allowNull, unique, ...rest } = config; // eslint-disable-line @typescript-eslint/no-unused-vars
  return {
    ...rest,
    allowNull: !!(
      typeof association === 'object' &&
      (!association.foreignKey ||
        (typeof association.foreignKey === 'object' &&
          association.foreignKey.allowNull))
    ),
  };
}
