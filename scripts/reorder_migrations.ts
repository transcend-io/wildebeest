#!/usr/bin/env node

// external
import { execSync } from 'child_process';
import { existsSync, renameSync, unlinkSync } from 'fs';
import difference from 'lodash/difference';
import { join } from 'path';

// Call bash command
const cmdSync = (str: string): string => execSync(str).toString();

// Logger
const logger = console;

/**
 * List all migration files on the base branch.
 *
 * @param ls - The ls command that will list the names of the migration files
 * @param migrationRoot - The folder of migrations
 * @returns The names of the migrations on the base branch
 */
function getMigrationsList(ls: string, migrationRoot: string): string[] {
  // List all of the migrations on the base branch
  const baseMigrations = cmdSync(`${ls} ${migrationRoot}`);

  // Return the migration names
  return baseMigrations
    .split('\n')
    .map((ln) => ln.split('/').pop() as string)
    .filter((x) => x);
}

/**
 * Determine the migration number based on its filename
 *
 * @param fileName - Name of file
 * @returns The migration number for that file
 */
function getMigrationNumber(fileName: string): number {
  return Number(fileName.split('-')[0]);
}

/**
 * Move a list of migrations to the end
 *
 * @param startFrom - The migration to start incrementing from
 * @param migrations - The list of migrations to move
 * @param migrationRoot - The folder of migrations
 */
function moveMigrationsToEnd(
  startFrom: number,
  migrations: string[],
  migrationRoot: string,
): void {
  // Start incrementing each migration
  let currentMigration = startFrom;

  // Iterate over each migration and move it to the end
  migrations.forEach((migrationToMove) => {
    // Construct the new file name
    const newMigrationName = [
      String(currentMigration),
      ...migrationToMove.split('-').slice(1),
    ].join('-');

    // Move the file
    logger.log(`Moving ${migrationToMove} to ${newMigrationName}`);
    renameSync(
      `${migrationRoot}/${migrationToMove}`,
      `${migrationRoot}/${newMigrationName}`,
    );

    // Increment for next migration
    currentMigration += 1;
  });
}

/**
 * Ensure that the old js build files are removed
 *
 * TODO this doesn't seem to be reliable
 *
 * @param migrations - The list of migration file names (with ts extension)
 * @param buildRoot
 */
function removeFromBuild(migrations: string[], buildRoot: string): void {
  migrations.forEach((migration) => {
    // Construct expected path to build
    const filePath = join(buildRoot, migration.replace('.ts', '.js'));
    const mapFilePath = `${filePath}.map`;

    // Remove file if built
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Remove .map file if built
    if (existsSync(mapFilePath)) {
      unlinkSync(mapFilePath);
    }
  });
}

/**
 * When merging in dev to your own branch, there is often conflicts in the ordering of migrations.
 * This script will automatically fix the migration ordering by placing all of the migrations you wrote at the end of the migrations list.
 *
 * `yarn script migrations/reorder`
 *
 * @param baseBranch - The base branch to compare against to determine current migration order
 * @param migrationRoot - The folder of migrations
 * @param buildRoot - Root of typescript build
 */
export function main(
  baseBranch: string,
  migrationsRoot: string,
  buildRoot?: string,
  verbose = false,
): void {
  // List the migrations on the base branch
  const baseMigrations = getMigrationsList(
    `git ls-tree -r --name-only ${baseBranch}`,
    migrationsRoot,
  );

  // List the migrations on this branch
  const currentMigrations = getMigrationsList('ls', migrationsRoot);

  // Determine which migrations were added on this branch
  const extraMigrations = difference(currentMigrations, baseMigrations);

  // Determine the last migration on base
  const lastMigrationNumber = getMigrationNumber(
    baseMigrations[baseMigrations.length - 1],
  );

  // Log out
  if (verbose) {
    logger.log({
      baseMigrations,
      currentMigrations,
      extraMigrations,
      lastMigrationNumber,
    });
  }

  // Move the migration files to the end
  moveMigrationsToEnd(lastMigrationNumber + 1, extraMigrations, migrationsRoot);

  // Remove the associated js files from the build folder
  if (buildRoot) {
    removeFromBuild(extraMigrations, buildRoot);
  }

  if (extraMigrations.length > 0) {
    logger.info(
      `Migrations fixed! You will likely need to run "yarn clean" from main root`,
    );
  } else {
    logger.info(`No migration conflicts :)`);
  }
}

// Environment variables
const {
  BASE_BRANCH = 'master',
  MIGRATIONS_ROOT,
  BUILD_ROOT,
  VERBOSE = false,
} = process.env;

if (!MIGRATIONS_ROOT) {
  throw new Error(
    `Expected environment variable "MIGRATIONS_ROOT" pointing to folder of migrations to compare`,
  );
}

// Run
main(BASE_BRANCH, MIGRATIONS_ROOT, BUILD_ROOT, VERBOSE);
