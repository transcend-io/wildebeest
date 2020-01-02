/**
 * Create a higher order migration definition
 *
 * TODO wildebeest
 */
export default {
  defaultName: 'createTable',
  description: 'Create a higher order migration definition',
  location: 'migrations/migrationTypes',
  mode: 'backend',
  nameTransform: 'camelCase',
  objectParams: 'options',
  skipActions: true,
  skipReturnPrompts: true,
  type: 'functionFile',
};
