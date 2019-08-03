/**
 *
 * ## Wildebeest Routes
 * Routes for running migrations
 *
 * @module wildbeest/routes
 * @see module:migrations
 */

// external modules
import express from 'express';

// local
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ModelMap } from '@wildebeest/types';
import * as controller from './controller';

/**
 * Construct a router
 */
export default <TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
): express.Router => {
  // instantiate a router
  const router = express.Router();

  // /////////// //
  // MIDDLEWARES //
  // /////////// //

  // Save the wildebeest onto res.locals
  router.all('*', (req, res, next) => {
    res.locals.wildebeest = wildebeest;
    next();
  });

  // /////////// //
  // CONTROLLERS //
  // /////////// //

  // Display the seed routes
  router.get('/', controller.renderRoutes);

  // Migrate all the way forward
  router.get('/current', controller.current);

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
