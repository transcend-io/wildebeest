/**
 *
 * ## Migrations Controller
 * Callback handlers for migration requests (/migrate).
 *
 * @module migrations/controller
 * @see module:migrations
 */

// external modules
import * as express from 'express';

// global
import {
  MAX_MIGRATION_DISPLAY,
  ONE_MINUTE,
  ONE_SECOND,
} from '@wildebeest/constants';

// models
import Migration from '@wildebeest/models/migration/Migration';

// local
import { ModelMap, WildebeestResponse } from '@wildebeest/types';
import writeSchema from './utils/writeSchema';

// TODO res.render needs to be setup

// Handle a migration error
const handleError = <TModels extends ModelMap>(
  res: WildebeestResponse<TModels>,
  props = {},
  status = 400,
): ((error: Error) => void) => ({ message, stack }): void => {
  // Log the error verbosely
  res.locals.wildebeest.logger.error(message);
  res.locals.wildebeest.verboseLogger.log(stack);

  // Render error with props
  res.status(status);
  return res.render('migrations/views/error', {
    layout: 'migrations/views/error',
    message,
    status,
    ...props,
  });
};

// Handle a migration success
const handleSuccess = <TModels extends ModelMap>(
  res: WildebeestResponse<TModels>,
  props = {},
  msg = 'migrated',
): ((timeTaken: number) => void) => (timeTaken: number) => {
  // Total time
  const totalTime = `${timeTaken / ONE_SECOND} seconds`;

  // Render success
  return res.render('migrations/views/success', {
    layout: 'migrations/views/success',
    message: `Successfully ${msg} in: ${totalTime}`,
    ...props,
  });
};

/**
 * Migrate to the current state
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns The current promise
 */
export async function current<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page, wipe },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Migrate (and optionally wipe)
  await wildebeest
    .runWithLock(async (lock) => {
      // First migrate to empty db if `wipe`
      if (wipe === 'true') {
        await lock.wipe();
      }
      // Migrate all of the way forward
      return lock.migrate();
    })
    .then(handleSuccess(res, props, 'migrated'))
    .catch(handleError(res, props));
}

/**
 * Migrate back to a migration
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function down<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
    params: { num },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Migrate down to some num
  await wildebeest
    .runWithLock((lock) => lock.downTo(num))
    .then(handleSuccess(res, props, `migrated down to ${num}`))
    .catch(handleError(res, props));
}

/**
 * Migrate all the way back to an empty db
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns The empty promise
 */
export async function empty<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Wipe the db
  await wildebeest
    .runWithLock((lock) => lock.wipe())
    .then(handleSuccess(res, props, 'emptied'))
    .catch(handleError(res, props));
}

/**
 * Display all of the migration routes
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function renderRoutes<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  // Get the id of the migration to display from
  const startIndex = page ? Number(page) : 0;
  const endIndex = startIndex + MAX_MIGRATION_DISPLAY;

  // The migrations to display
  const currentMigration = await Migration.latest();

  // Check if a num has been run
  const checkIsRun = (checkNum: string): boolean =>
    currentMigration
      ? checkNum.localeCompare(currentMigration.num()) <= 0
      : false;

  // Get the migrations to display on the page
  const displayMigrations = wildebeest.reversedMigrations
    .slice(startIndex, endIndex)
    .map((migration) =>
      Object.assign({}, migration, { isRun: checkIsRun(migration.num) }),
    );

  // Back page
  const backPage = startIndex - MAX_MIGRATION_DISPLAY;

  // Next page
  const nextPage = startIndex + MAX_MIGRATION_DISPLAY;

  // Render all of the potential seed routes
  return res.render('migrations/views', {
    backPage,
    hasBackPage: backPage >= 0,
    hasNextPage: endIndex < wildebeest.reversedMigrations.length,
    migrations: displayMigrations,
    nextPage,
    page,
    layout: 'migrations/views/index',
  });
}

/**
 * Test that the db is in sync with the code
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function sync<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Set timeout to a long time
  req.setTimeout(ONE_MINUTE * 5, () => wildebeest.logger.error('TIMEOUT'));

  // Run tests on migrations
  let synced: boolean;
  return wildebeest
    .runWithLock(async () => {
      synced = await wildebeest.syncTest();
    })
    .then((runTime) =>
      synced
        ? handleSuccess(
            res,
            props,
            'checked that the db is in sync with the Sequelize definitions :) Ran',
          )(runTime)
        : handleError(res, props)(
            new Error(
              'The db is out of sync with the Sequelize definitions! Check terminal output for potential errors.',
            ),
          ),
    )
    .catch(handleError(res, props));
}

/**
 * Migrate to 0 down, then all the way up, all the way down and then back up
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function test<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Set timeout to a long time
  req.setTimeout(ONE_MINUTE * 10, () => wildebeest.logger.error('TIMEOUT'));

  // Run tests on migrations
  await wildebeest
    .runWithLock((lock) => lock.test())
    .then(handleSuccess(res, props, 'passed tests'))
    .catch(handleError(res, props));
}

/**
 * Migrate up to a migration
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function up<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
    params: { num },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  // Migrate up to some num
  return wildebeest
    .runWithLock((lock) => lock.upTo(num))
    .then(handleSuccess(res, props, `migrated up to ${num}`))
    .catch(handleError(res, props));
}

/**
 * Write a schema to file
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export async function writeSchemaByName<TModels extends ModelMap>(
  req: express.Request,
  res: WildebeestResponse<TModels>,
): Promise<void> {
  const {
    query: { page },
    params: { name },
  } = req;
  const {
    locals: { wildebeest },
  } = res;
  const props = { page };

  try {
    await writeSchema(wildebeest, name);
    return res.render('migrations/views/success', {
      layout: 'migrations/views/success',
      message: `Successfully wrote schema: "${name}"`,
      ...props,
    });
  } catch (err) {
    return handleError(res, props)(err);
  }
}
