// external modules
import * as fs from 'fs';
import { join } from 'path';
import { CompilerOptions } from 'typescript';

/**
 * Get the typescript configuration in the directory
 *
 * @param directory - The directory to look for the tsconfig in
 * @param tsConfigPath - The path to the tsconfig if not in the expected tsconfig.json location
 * @returns The tsconfig or throws an error
 */
export default function getCompilerOptions(
  directory: string,
  tsConfigPath = join(directory, 'tsconfig.json'),
): CompilerOptions {
  // ensure the file exists
  if (!fs.existsSync(tsConfigPath)) {
    throw new Error(`Path to tsconfig does not exist: "${tsConfigPath}"`);
  }

  // Remove single-line comments.
  // Comments are allowed in tsconfig.json, but not allowed in standard json format, which `JSON.parse` expects.
  const tscJson = fs
    .readFileSync(tsConfigPath, 'utf-8')
    .replace(/\/\/.*?\n|\/\* .*?\n/g, '');

  // Parse to JSON
  return JSON.parse(tscJson).compilerOptions as CompilerOptions;
}
