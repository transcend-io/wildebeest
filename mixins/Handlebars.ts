/**
 *
 * ## Handlebars
 * Creates the handlebars instance
 *
 * @module Handlebars
 */

// external modules
import Handlebars from 'handlebars';

// helpers
import pascalCase from './helpers/pascalCase';

// Set the helpers
Handlebars.registerHelper('pascalCase', pascalCase);
Handlebars.registerHelper('pad', (word: string) => '/'.repeat(word.length));
Handlebars.registerHelper('ifNotEqual', function ifNotEqual(
  this: any,
  arg1: string,
  arg2: string,
  options: Handlebars.HelperOptions,
) {
  return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
});

export default Handlebars;
