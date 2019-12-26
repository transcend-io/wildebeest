/**
 * Add a new migration file
 *
 * @param data - The prompt answers
 * @param repo - The repository configuration
 * @returns The action
 */
export const ADD_MIGRATION_FILE = ({ templateName }) => ({
  path: '{{ location }}/{{ migrationNumber }}-{{ name }}',
  templateName,
  type: 'addFile',
});
