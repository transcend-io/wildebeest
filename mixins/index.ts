#!/usr/bin/env node

// Convert all paths at first
import './convert_paths';

/* tslint:disable no-relative-imports */
// external modules
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// local
import Handlebars from './Handlebars';
import {
  createBase,
  extractAssociationDefinitions,
  getCompilerOptions,
  setConfigDefaults,
} from './helpers';
import { BaseFileInput } from './types';

/**
 * Main runnner for mixin generation
 *
 * @param configPath - The path to the config specified via command line arg
 */
function main(configPath: string = join(process.cwd(), 'wildebeest.js')): void {
  // Ensure the path exists
  if (!existsSync(configPath)) {
    throw new Error(`Wildebeest config does not exist at: "${configPath}"`);
  }

  // Read in the config and set defaults
  const config = setConfigDefaults(require(configPath)); // eslint-disable-line global-require,import/no-dynamic-require

  // Register any custom handlebars helpers
  Object.entries(config.handlebarsHelpers).map(([name, func]) =>
    Handlebars.registerHelper(name, func),
  );

  // Compile the handelbars template
  const TEMPLATE = Handlebars.compile<BaseFileInput>(
    readFileSync(config.baseModelTemplatePath, 'utf-8'),
  );

  // Get the typescript compiler options
  const compilerOptions = getCompilerOptions(
    config.rootPath,
    config.tsConfigPath,
  );

  // Extract the association definitions for each model
  const associationFiles = extractAssociationDefinitions(
    [`${config.rootPath}/${config.src}`],
    {
      ...compilerOptions,
      moduleResolution: undefined,
    },
    config,
  );

  // Process each definition and generate the Base model file
  associationFiles.forEach((associationDefinition) =>
    createBase(associationDefinition, TEMPLATE, config),
  );

  // print out the doc
  // writeFileSync('types.json', JSON.stringify(output, undefined, 4));
}

// Run the main script
main(process.argv[2]);
