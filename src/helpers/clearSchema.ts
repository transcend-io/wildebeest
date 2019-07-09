// external modules
import sequelize from 'sequelize';

/**
 * Re create a schema
 *
 * @param queryInterface - The sequelize queryInterface
 * @param schema - The name of the schema
 * @returns The refresh schema promise
 */
export default async function clearSchema(
  queryInterface: sequelize.QueryInterface,
  schema = 'public',
): Promise<void> {
  // Drop the schema
  await queryInterface.dropSchema(schema);

  // Re-create it
  await queryInterface.createSchema(schema);
}
