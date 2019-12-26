// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

// local
import changeColumn from './changeColumn';

/**
 * Options for making a UUID column non null
 */
export type UUIDNonNullOptions = {
  /** The name of the table to modify */
  tableName: string;
  /** The name of the uuid column */
  columnName: string;
  /** When true, drop all null values */
  destroy?: boolean;
};

/**
 * Make a uuid column non null
 *
 * @param options - Options for making the uuid column non-null
 * @returns The uuid non null migrator
 */
export default function uuidNonNull<TModels extends ModelMap>(
  options: UUIDNonNullOptions,
): MigrationDefinition<TModels> {
  const { tableName, columnName, destroy = false } = options;
  return changeColumn({
    tableName,
    columnName,
    getOldColumn: ({ DataTypes }) => ({
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    }),
    getNewColumn: ({ DataTypes }) => ({
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    }),
    destroy,
  });
}
