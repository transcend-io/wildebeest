// external modules
import flatten from 'lodash/flatten';
import transform from 'lodash/transform';
import uuidv4 from 'uuid/v4';

// commons
import indexBy from '@commons/utils/indexBy';

// models
import { DEFAULT_TEMPLATE_TO_COMMUNICATION_TYPE } from '@bk/models/communication/helpers/sendCommunicationByDefault';
import { DEFAULT_TEMPLATE_NAME } from '@bk/models/template/enums';

// wildebeest
import {
  DefineColumns,
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator
} from '@wildebeest/types';

// local
import { addTableColumns, removeTableColumns } from './addColumns';
import { addValuesToEnum, removeValuesFromEnum } from './addEnumValues';

/**
 * New template
 */
export type NewTemplate = {
  /** The email subject of the template */
  subject: string;
  /** The template itself */
  template: string;
};

/**
 * Options for adding a new api version
 */
export type NewDefaultTemplateOptions = {
  /** The templates to add */
  templates: { [k in string]: NewTemplate };
};

/**
 * Convert templates to their respective requestSettings columns
 *
 * @param templates - The template inputs
 * @returns Get columns
 */
function templatesToColumns(
  templates: { [k in string]: NewTemplate },
): DefineColumns {
  return ({ DataTypes }) =>
    // Map to ids
    transform(
      templates,
      (acc, template, name) =>
        Object.assign(acc, {
          [`${name}Id`]: {
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            type: DataTypes.UUID,
          },
        }),
      {},
    );
}

/**
 * Add a new version of the api
 *
 * @param templates - The templates to add
 * @param transactionOptions - The transaction options
 * @param db - The database to operate on
 */
export async function addDefaultTemplates(
  templates: { [k in string]: NewTemplate },
  transactionOptions: MigrationTransactionOptions,
  db: SequelizeMigrator,
): Promise<void> {
  const { queryT } = transactionOptions;

  // 1) Add the default templates to each org
  await queryT.batchProcess(
    'organizations',
    {
      attributes: 'id',
    },
    ({ id }) =>
      queryT.insert(
        'templates',
        flatten(
          Object.entries(templates).map(([templateName, template]) => ({
            title: DEFAULT_TEMPLATE_NAME[templateName],
            ...template,
            organizationId: id,
            id: uuidv4(),
            isCustom: false,
            updatedAt: new Date(),
            createdAt: new Date(),
          })),
        ),
      ),
  );

  // 2) Add the column template id columns to the requestSettings table
  await addTableColumns(
    db,
    {
      // Add the columns to the request settings table
      tableName: 'requestSettingses',
      // UUID non null columns
      getColumns: templatesToColumns(templates),
      // Set the default values based on the newly added templates
      getRowDefaults: ({ organizationId }) =>
        queryT
          .select(
            `SELECT * FROM "templates" WHERE "organizationId"='${organizationId}'`,
          )
          .then((templateInstances) => {
            // Lookup from template title to id
            const lookupTemplateId = indexBy(templateInstances, 'title');
            return transform(
              templates,
              (acc, template, name) =>
                Object.assign(acc, {
                  [`${name}Id`]: lookupTemplateId[DEFAULT_TEMPLATE_NAME[name]]
                    .id,
                }),
              {},
            );
          }),
      // Add a constraint for each
      constraints: Object.keys(templates).map((templateName) => ({
        columnName: `${templateName}Id`,
        tableName: 'templates',
      })),
      onDelete: 'NO ACTION',
    },
    transactionOptions,
  );

  // 3) Add enum values to communications table
  await addValuesToEnum(
    db,
    {
      name: 'enum_communications_type',
      attributes: Object.keys(templates).map(
        (name) => DEFAULT_TEMPLATE_TO_COMMUNICATION_TYPE[name],
      ),
      tableName: 'communications',
      columnName: 'type',
    },
    transactionOptions,
  );
}

/**
 * Add a new version of the api
 *
 * @param templates - The templates to remove
 * @param transactionOptions - The transaction options
 * @param db - The database to operate on
 */
export async function removeDefaultTemplates(
  templates: { [k in string]: NewTemplate },
  transactionOptions: MigrationTransactionOptions,
  db: SequelizeMigrator,
): Promise<void> {
  const { queryT } = transactionOptions;

  // 1) Remove enum values from communications table
  await removeValuesFromEnum(
    db,
    {
      name: 'enum_communications_type',
      attributes: Object.keys(templates).map(
        (name) => DEFAULT_TEMPLATE_TO_COMMUNICATION_TYPE[name],
      ),
      tableName: 'communications',
      columnName: 'type',
      drop: true,
    },
    transactionOptions,
  );

  // 2) Remove allcolumns from request settings
  await removeTableColumns(
    db,
    {
      // Add the columns to the request settings table
      tableName: 'requestSettingses',
      // UUID non null columns
      getColumns: templatesToColumns(templates),
    },
    transactionOptions,
  );

  // 3) Remove the default templates from each org
  await queryT.delete('templates', {
    title: Object.keys(templates).map((name) => DEFAULT_TEMPLATE_NAME[name]),
  });
}

/**
 * Add a new default template
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for adding a new default template
 * @returns The migrator
 */
export default function newDefaultTemplate({
  templates,
}: NewDefaultTemplateOptions): MigrationDefinition {
  return {
    // Add the unique index
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        addDefaultTemplates(templates, transactionOptions, db),
      ),
    // Remove the index
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        removeDefaultTemplates(templates, transactionOptions, db),
      ),
  };
}
