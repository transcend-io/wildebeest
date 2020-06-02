/**
 * Handlebars templates used for the running wildebeest migrations.
 */

// external
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';

// helpers
import type { ObjByString } from '@wildebeest/types';
import pascalCase from '@wildebeest/utils/pascalCase';
import { join } from 'path';

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

const TEMPLATES = {
  error: readFileSync(join(__dirname, 'error.hbs'), 'utf-8'),
  index: readFileSync(join(__dirname, 'index.hbs'), 'utf-8'),
  success: readFileSync(join(__dirname, 'success.hbs'), 'utf-8'),
};

/**
 * Render some HTML
 *
 * @param name - The name of the template to use
 * @param params - The handlebars compilation params
 * @returns The HTML template
 */
export default function render(
  name: keyof typeof TEMPLATES,
  params: ObjByString,
): string {
  return Handlebars.compile(TEMPLATES[name])(params);
}
