// external modules
import { QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ONE_MINUTE, ONE_SECOND } from '@wildebeest/constants';
import {
  Attributes,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';

/**
 * Options to define which rows to process
 */
export type WhereOptions = {
  /** The attributes needed to process (SELECT [<e>] FROM ...), by default entire row is returned */
  attributes?: string;
  /** The total number of rows to process in parallel */
  limit?: number;
  /** The where match statement ( WHERE <where> ) */
  where?: string;
  /** The order to process (default is createdAt ASC) */
  orderBy?: string;
};

/**
 * Loop over a table in batches and process each row by some function.
 *
 * @param db - The db to process against
 * @param tableName - The name of the table to operate on
 * @param whereOptions - The options to determine which rows rows to process
 * @param processRow - A function to process each row
 * @param rawTransactionOptions - The current transaction
 * @param logThreshold - A threshold to log the results when the processing takes longer than this about of time in ms
 * @returns The total number of processed rows
 */
export default async function batchProcess<
  T extends {},
  TModels extends ModelMap,
  TAttributes extends Attributes
>(
  { db, logger }: Wildebeest<TModels>,
  tableName: string,
  whereOptions: WhereOptions = {},
  processRow: (row: T) => void | Promise<void>,
  transactionOptions?: MigrationTransactionOptions<TModels, TAttributes>,
  logThreshold: number = ONE_MINUTE / 3,
): Promise<number> {
  const { queryInterface } = db;
  const {
    where = '',
    attributes = '*',
    limit = 1000,
    orderBy = 'id',
  } = whereOptions;
  let offset = 0;
  let remaining = true;

  let processed = 0;
  const t0 = new Date().getTime();

  // Log every logThreshold seconds
  let innerLogThreshold = logThreshold;

  // Loop over the table until all rows have been processed
  while (remaining) {
    /* eslint-disable no-await-in-loop */
    // Get the next batch of rows to process
    const rows: T[] = await queryInterface.sequelize.query(
      `
        SELECT ${attributes}
        FROM "${tableName}"
        ${where ? `WHERE ${where}` : ''}
        ORDER BY ${orderBy}
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      { type: QueryTypes.SELECT, ...transactionOptions },
    );

    // Process the rows
    await Promise.all(rows.map(processRow));
    processed += rows.length;

    // Update
    offset += limit;
    remaining = rows.length === limit;

    // Log when the processing takes a long time
    const interimTime = new Date().getTime() - t0;
    if (interimTime > innerLogThreshold) {
      innerLogThreshold += logThreshold;
      logger.info(
        `[${tableName} batchProcess - loop]: Processed "${processed}" rows in "${interimTime /
          ONE_SECOND}" seconds`,
      );
    }
  } /* eslint-enable no-await-in-loop */

  const t1 = new Date().getTime();
  const totalTime = t1 - t0;

  // Log when the processing takes a long time
  if (totalTime > logThreshold) {
    logger.info(
      `[${tableName} batchProcess]: Processed "${processed}" rows in "${totalTime /
        ONE_SECOND}" seconds`,
    );
  }

  return processed;
}
