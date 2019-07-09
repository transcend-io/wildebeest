/**
 *
 * ## DbMigration Actions
 * Actions for the db migration generatorType.
 *
 * @module dbMigration/actions
 * @see module:dbMigration
 */

/**
 * Add a new migration file
 *
 * @param {module:typeDefs~Answers}               data - The prompt answers
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopAction} The action
 */
module.exports.ADD_MIGRATION_FILE = ({ templateName }) => ({
  path: '{{ location }}/{{ migrationNumber }}-{{ name }}',
  templateName,
  type: 'addFile',
});
