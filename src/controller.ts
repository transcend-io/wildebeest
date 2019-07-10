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

// local
import Wildebeest from './index';
import writeSchema from './utils/writeSchema';

const REVERSED_MIGRATIONS = [...MIGRATIONS].reverse();

// Handle a migration error
const handleError = (
  wildbeest: Wildebeest,
  res: express.Response,
  props = {},
  status = 400,
): ((error: Error) => void) => ({ message, stack }): void => {
  // Log the error verbosely
  wildbeest.logger.error(message);
  wildbeest.verboseLogger.log(stack);

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
const handleSuccess = (
  res: express.Response,
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
export async function current(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    app: {
      locals: { db },
    },
    query: { page, wipe },
  } = req;
  const props = { page };

  // Migrate (and optionally wipe)
  await db
    .model('migrationLock')
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
export async function down(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    params: { num },
    app: {
      locals: { db },
    },
  } = req;
  const props = { page };

  // Migrate down to some num
  await db
    .model('migrationLock')
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
export async function empty(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    app: {
      locals: { db },
    },
  } = req;
  const props = { page };

  // Wipe the db
  await db
    .model('migrationLock')
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
export async function renderRoutes(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    app: {
      locals: { db },
    },
    query: { page },
  } = req;
  // Get the id of the migration to display from
  const startIndex = page ? Number(page) : 0;
  const endIndex = startIndex + MAX_MIGRATION_DISPLAY;

  // The migrations to display
  const currentMigration = await Migration.latest();

  // Check if a num has been run
  const checkIsRun = (checkNum): boolean =>
    currentMigration
      ? checkNum.localeCompare(currentMigration.num()) <= 0
      : false;

  // Get the migrations to display on the page
  const displayMigrations = REVERSED_MIGRATIONS.slice(startIndex, endIndex).map(
    (migration) =>
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
    hasNextPage: endIndex < REVERSED_MIGRATIONS.length,
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
export async function sync(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    app: {
      locals: { db },
    },
  } = req;
  const props = { page };

  // Set timeout to a long time
  req.setTimeout(ONE_MINUTE * 5, () => logger.error('TIMEOUT'));

  // Run tests on migrations
  let synced;
  return db
    .model('migrationLock')
    .runWithLock(async () => {
      synced = await testSetup(db, models);
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
export async function test(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    app: {
      locals: { db },
    },
  } = req;
  const props = { page };

  // Set timeout to a long time
  req.setTimeout(ONE_MINUTE * 10, () => logger.error('TIMEOUT'));

  // Run tests on migrations
  await db
    .model('migrationLock')
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
export async function up(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    params: { num },
    app: {
      locals: { db },
    },
  } = req;
  const props = { page };

  // Migrate up to some num
  return db
    .model('migrationLock')
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
export async function writeSchemaByName(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const {
    query: { page },
    params: { name },
  } = req;
  const props = { page };

  try {
    await writeSchema(name);
    return res.render('migrations/views/success', {
      layout: 'migrations/views/success',
      message: `Successfully wrote schema: "${name}"`,
      ...props,
    });
  } catch (err) {
    return handleError(res, props)(err);
  }
}
