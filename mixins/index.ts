#!/usr/bin/env node

// Convert all paths at first
import './convert_paths';

/* tslint:disable no-relative-imports */
// external
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
import { BaseFileInput, GenerateMixinsConfig } from './types';

/**
 * Main runner for mixin generation
 *
 * @param configPath - The path to the config specified via command line arg
 */
export default function generateMixins(
  mixinConfig: GenerateMixinsConfig,
): void {
  // Read in the config and set defaults
  const config = setConfigDefaults(mixinConfig);

  // Register any custom handlebars helpers
  Object.entries(config.handlebarsHelpers).map(([name, func]) =>
    Handlebars.registerHelper(name, func),
  );

  // Compile the handlebars template
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
