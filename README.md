<p align="center">
    <img alt="Sombra" src="https://user-images.githubusercontent.com/7354176/61021920-5761fd80-a358-11e9-8eb4-34e0ea774a9a.jpg"/>
</p>
<h1 align="center">Wildebeest</h1>
<p align="center">
  <strong>A migration framework for <a href="http://docs.sequelizejs.com/">Sequelize</a>.</strong><br /><br />
  <i></i>
</p>
<br />

[![Build Status](https://travis-ci.com/transcend-io/wildebeest.svg?token=dSiqFoEr9c1WZuWwxbXE&branch=master)](https://travis-ci.com/transcend-io/wildebeest)

![wildebeest](https://user-images.githubusercontent.com/7354176/61021920-5761fd80-a358-11e9-8eb4-34e0ea774a9a.jpg)

TODO Cleanup migration docs and increase readability

## TODO

Although we are using Sequelize as our ORM, we still need to write database migrations manually.
The main reason for writing them manually is to have the ability to transform data from one database state to another.
i.e. When adding a new column that is non-null, you often need to calculate what the initial value should be on existing database rows.

Migrations can be a pain, especially if you want to keep the Postgres schema in sync with the Sequelize schema defined in code.
Normally the schema is Postgres should be thought of as the "true" schema, but then you lose the ability to dynamically define the schema with code,
and you constantly have to check that the code is in sync with the database it is plugged into.

To simplify this process, we have a database [Model](https://github.com/transcend-io/main/blob/dev/backend/src/db/ModelManager.ts) class that wraps
around all database tables we define. This Model class has a method `checkIfSynced` that will compare the code definition of that Sequelize model,
to the existing schema in Postgres, and it will log to console anywhere it finds these definitions to be out of sync.
In production mode, the server will call this function before starting up and fail if the migrations have not been run.
In development mode, the developer must go to [/migrate/sync](https://yo.com:4001/migrate/sync) in order to run this sync test.
This route is also hit during the integration tests that run with `npm run test` and so a PR will not be able to merge
if the database is not properly migrated.

When writing migrations, we need to specify what will happen when the migration is run up and down.
Production systems will only ever run migrations in an up manner, where data is conserved and not lost.
The down migrations are useful in development to be able to revert back to a previous database state.

The preferred mechanism for writing migrations is to break each migration into small parts, and use configuration where possible,
rather than actually writing both the up and down migrations manually.
We currently have a variety of [migration-types]{@link module:migrationTypes} that
will simplify the process of writing migrations, and make the migrations themselves more readable.

A good example of migration-types that can be useful are `addColumns` and `removeColumns`.
These two migration types can be configured the exact same way because they are actually the same migration except up and down are swapped.
Take this example of an `addColumns` migration:

### Add Columns to Existing Table with Data

```ts
export default addColumns({
   tableName: 'requests',
   getColumns: ({ DataTypes }) => ({
     // The subject class of the request
     subjectName: {
       type: DataTypes.STRING,
       allowNull: false,
       defaultValue: 'customer',
     },
     // The id to the subject
     subjectId: {
       allowNull: true,
       defaultValue: DataTypes.UUIDV4,
       type: DataTypes.UUID,
    },
   }),
   getRowDefaults: ({ organizationId }, db, { queryT }) => queryT.select(
     `SELECT FROM "requestSettingses" WHERE "organizationId"='${organizationId}'`
   )
     .then(([{ id }]) => queryT.select(
      `SELECT id,"requestSettingsId","type","name" FROM "subjects" WHERE "requestSettingsId"='${id}' AND "type"='customer'`
     ))
     .then((subjects) => subjects.length > 0
       ? ({ subjectId: subjects[0].id })
       : ({})
     ),
   constraints: ['subjectId'],
});
```

Here we are adding two columns to the `requests` table: `subjectName` and `subjectId`.
Note that `subjectName` is non-null and `subjectId` should have a foreign key constraint to the `subjects` table.
In addition, we expect that the `requests` table already has data in it and we want to populate these rows retroactively.

The `addColumns` migration type takes in a `constraints` property that will create a foreign key constraint for one of the columns,
after that column has been added to the table. Here `subjectId` will get a constraint to `subjects.id`,
which is inferred from the column name. You can specify this manually as well: `{ columnName: 'subjectId', tableName: 'subjects' }`.

Secondly, `addColumns` migration type takes in a `getRowDefaults` property which is a function that takes in an existing row in the table,
and outputs an object of `columnName:value` where `columnName` is the name of a column that should change value for that row instance,
and `value` is the new value. The migration will run in the following order:

1. First the columns will be created. If the column is `NON NULL`, and `getRowDefaults` is provided, the column will temporarily `ALLOW NULL`
2. `getRowDefaults` will be executed on each existing row, and the row will be updated according to the function result.
3. The column will add back the `NON NULL` constraint after all rows are migrated

NOTE: these migration types are not yet completely wrapped in transactions. If you are developing and make a mistake in this definition,
you may want to perform a hard wipe on the db or do manual db schema editing to fix the lost state.

A nice property of using this sync testing framework in combination with these `migration-types` is that the sync test wil provide a
list of migrations that need to be run, these migrations almost always will map to a migration type,
and then the [generators](https://github.com/transcend-io/generators) can be used to quickly create migrations.
The generators will do their best to fill out the majority of the migration-type configuration from the existing code.
In the example case above, everything would be generated except for the property `getRowDefaults`, which you would be prompted to define.

The flow for creating a migration is as follows:

1. You write code that changes the structure of the db. This may be adding a db column in `attributes.js`,
     adding a new association in `associations.js`, defining a new table, or defining a new database index in `options.js`.
2. You run `npm run generate:migrate` to list the migration types that are available. You can add an alias to your `~/.bash_profile`
     to shorten this command: `alias mig="npm run generate:migrate $1"`
3. You select the `migration-type` you want to run (the manual up/down migration is called `custom`).
4. Follow the generator prompt and fill in the missing pieces
5. If the migration can be completely generated from the command line, the server should detect changes and restart,
     running the migration immediately. If the migration still requires some input from the developer (i.e. a `custom` migration),
     the migration will throw an error on start and the server will crash. You should write the migration and re-start the server.

The motivation for this framework is to reduce the burden of writing migrations. The developer should focus on writing code, not migrations.
Code will verify the state of the database, and the process of translating the code into migrations is made as automatic as possible.

NOTE: Migrations that are deleting things (like `remove-columns` or `drop-table`) are a bit different than migrations that
create things (like `add-columns` or `create-table`). The columns for creating things will assume that the code is always
defined first, and so you will be able to select only columns that exist in code. In comparison,
the developer may/oftentimes removes the code definition for something before creating the destroy migration.
When the destroy migration cannot find a column definition, the developer will be prompted to input that definition.
If you change the work-flow and instead create the destroy migration before removing the code definition,
the destroy migration types can auto-populate the columns and whatnot.

This entire framework will ideally be packaged into its own npm module at some point. [check the issue](https://github.com/transcend-io/gdpr-backend/issues/385).

There are also still a couple issues with this framework that still need to be [fleshed out](https://github.com/transcend-io/gdpr-backend/issues/363).
The main issue is that this framework creates a ton of migrations. Currently there are 750+ migrations, where each migration is very small.
This introduces two problems:

1. It is difficult to understand what the migrations are doing. You can tell that columns are being added, then indexes removed, etc etc,
     but it is not clear what the purpose of these migrations are for.
2. When multiple people are simultaneously developing, the migration numbers will overlap and the developer will need to re-number the migrations when they rebase to the master branch.

The proposed solution is to split migrations into folders or configurations where each folder is a feature.
The existing `migration-types` would be compiled into a list, and the migration would run by executing all of the migrations in that list,
one by one, in a transaction. The developer would be allowed to add/remove/re-order the migrations within that folder while they develop,
and only once it is pushed to master is when that migration is supposed to stay permanent. This should solve the two issues above because;

1. The migrations can be documented in a group. i.e. all migrations in this folder and related to making the privacy center configurable via the backend api.
2. Each PR should really only have a single migration. This will still mean that the migrations re-numbered, but you should
     only ever have to change the number for a single migration  folder, not a set of 10 or 20 migration files.

Until this new framework is in place, the current process for re-ordering migrations is as follows:

1. Rebase your branch to master: `git fetch && git rebase -i origin/master`
2. Open `src/migrations/migrations` and find where numbers start to overlap. The server will not start if the ordering is off.
3. Move all of the migrations on the branch you are working on to the end of the migration chain. You can use the command `npm run refactor reorder-migrations`.
4. You will need to do a wipe on your local db and re-run the migrations, you can do this on the [/migrate](https://yo.com:4001/migrate)
   page or with the command `npm run server:dev:clean && npm run server:dev:uplogs`


*Only will work when RUN apk add --no-cache postgresql-client=10.5-r0 is not commented out in app.Dockerfile*
TODO first migration expected to be genesis
