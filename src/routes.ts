/**
 *
 * ## Db Migrations Routes
 * Routes for running migrations
 *
 * @module migrations/routes
 * @see module:migrations
 */

// external modules
import express from 'express';

// local
import * as controller from './controller';
import Wildebeest from './Wildebeest';

/**
 * Construct a router
 */
export default (wildebeest: Wildebeest): express.Router => {
  // instantiate a router
  const router = express.Router();

  // /////////// //
  // CONTROLLERS //
  // /////////// //

  // Display the seed routes
  router.get('/', controller.renderRoutes);

  // Migrate all the way forward
  router.get('/current', controller.current as express.RequestHandler);

  // Migrate all the way back
  router.get('/empty', controller.empty);

  // Check if the db is in sync with code
  router.get('/sync', controller.sync);

  // Run genesis down, then all the way up, down up, down, up
  router.get('/test', controller.test);

  // Run up to this migration
  router.get('/up/:num', controller.up);

  // Run down to this migration
  router.get('/down/:num', controller.down);

  // Write the current schema to file
  if (wildebeest.allowSchemaWrites) {
    router.get('/write-schema/:name', controller.writeSchemaByName);
  }
  return router;
};
