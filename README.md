<p align="center">
  <img alt="Wildebeest by Transcend" src="https://user-images.githubusercontent.com/7354176/61022044-e3742500-a358-11e9-9cb2-122abb33e1b5.jpg"/>
</p>
<h1 align="center">Wildebeest</h1>
<p align="center">
  <strong>A database migration framework for <a href="http://docs.sequelizejs.com/">Sequelize</a>.</strong>
  <br /><br />
  <i>Coming soon. This repo is currently a work in progress.</i>
  <br /><br />
  <img href="https://travis-ci.com/transcend-io/wildebeest.svg?branch=master" alt="Travis (.com)" src="https://travis-ci.com/transcend-io/wildebeest.svg">
</p>
<br />

## Overview

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftranscend-io%2Fwildebeest.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftranscend-io%2Fwildebeest?ref=badge_shield)

(This repo and its docs are a work in progress)

When using Sequelize as your ORM, you still need to write some database migrations manually. For example, when adding a new column that is non-null, one often needs to calculate the initial value based on existing database rows.

Keeping the Postgres schema in sync with the Sequelize schema defined in code is painful. The schema in Postgres should be thought of as the "base truth", but it comes at the cost of being able to dynamically define the schema in code. One must repeatedly compare the code against the remote database's state.

To simplify this process, we have a database Model class that wraps all database tables we define. This Model class has a method, `checkIfSynced`, that will compare the code definition of that Sequelize model to the existing schema in Postgres. It will log anywhere it finds these definitions to be out of sync.

In production mode, the server will call this function before starting up, and fail if the migrations have not been run.

In development mode, the developer must go to `localhost/migrate/sync` to run this synchronization test.

This route is also hit during the integration tests that run with `npm run test`, so a PR will not be able to merge if the database is not properly migrated.

When writing migrations, you need to specify what will happen when the migration is run, "up" and "down" - forward and in reverse.

Production systems will only ever run migrations in an up manner, where data is conserved and not lost.

The down migrations are useful in development to be able to revert back to a previous database state.

The preferred mechanism for writing migrations is to break each migration into small parts, and use configuration where possible, rather than actually writing both the up and down migrations manually.

We currently have a variety of [migration-types]{@link module:migrationTypes} that simplify the process of writing migrations, and make the migration code more readable.

See `addColumns` and `removeColumns` below for examples of `migration-types`. These migration types can be configured in the same way, because they are actually the same migration, but up and down are swapped.

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
  getRowDefaults: ({ organizationId }, db, { queryT }) =>
    queryT
      .select(
        `SELECT FROM "requestSettingses" WHERE "organizationId"='${organizationId}'`,
      )
      .then(([{ id }]) =>
        queryT.select(
          `SELECT id,"requestSettingsId","type","name" FROM "subjects" WHERE "requestSettingsId"='${id}' AND "type"='customer'`,
        ),
      )
      .then((subjects) =>
        subjects.length > 0 ? { subjectId: subjects[0].id } : {},
      ),
  constraints: ['subjectId'],
});
```

Here we are adding two columns to the `requests` table: `subjectName` and `subjectId`.
Note that `subjectName` is non-null and `subjectId` should have a foreign key constraint to the `subjects` table.
We expect that the `requests` table already has data in it and we want to populate these rows retroactively.

The `addColumns` migration type takes in a `constraints` property that will create a foreign key constraint for one of the columns,
after that column has been added to the table. Here `subjectId` will get a constraint to `subjects.id`,
which is inferred from the column name. You can specify this manually as well: `{ columnName: 'subjectId', tableName: 'subjects' }`.

The `addColumns` migration type takes in a `getRowDefaults` property, which is a function that takes in an existing row in the table,
and outputs an object of `columnName:value`, where `columnName` is the name of a column that should change value for that row instance,
and `value` is the new value. The migration will run in the following order:

1. The columns will be created. If the column is `NON NULL`, and `getRowDefaults` is provided, the column will temporarily `ALLOW NULL`
2. `getRowDefaults` will be executed on each existing row, and the row will be updated according to the function result.
3. The column will add back the `NON NULL` constraint after all rows are migrated

NOTE: these migration types are not completely wrapped in transactions yet. If you are developing and make a mistake in this definition,
you may want to perform a hard wipe on the DB or manually edit DB schema to fix the lost state.

A nice property of using this sync testing framework in combination with these `migration-types` is that the sync test wil provide a
list of migrations that need to be run. These migrations almost always will map to a migration type.

The [generators](https://github.com/transcend-io/wildebeest/tree/master/generators) can be used to quickly create migrations.
Generators will fill out the majority of the `migration-type` configuration from the existing code.
In the example above, everything is generated except for the property `getRowDefaults`, which you would be prompted to define.

The flow for creating a migration is as follows:

1. Write code that changes the structure of the db. This may be adding a db column in `attributes.js`,
   adding a new association in `associations.js`, defining a new table, or defining a new database index in `options.js`.
2. Run `npm run generate:migrate` to list the migration types that are available. You can add an alias to your `~/.bash_profile`
   to shorten this command: `alias mig="npm run generate:migrate $1"`
3. Select the `migration-type` you want to run (the manual up/down migration is called `custom`).
4. Follow the generator prompt and fill in the missing pieces
5. If the migration can be completely generated from the command line, the server should detect changes and restart,
   running the migration immediately. If the migration still requires some input from the developer (i.e. a `custom` migration),
   the migration will throw an error on start and the server will crash. You should write the migration and re-start the server.

The motivation for this framework is to reduce the burden of writing migrations. The developer should focus on writing code, not migrations.
Code will verify the state of the database, and the process of translating the code into migrations is made as automatic as possible.

NOTE: Migrations which delete things (like `remove-columns` or `drop-table`) are different from migrations which
create things (like `add-columns` or `create-table`). The columns for creating things will assume that the code is always
defined first, and so you will be able to select only columns that exist in code. When deleting things,
the developer often removes the code definition for something before creating the destroy migration.
When the destroy migration cannot find a column definition, the developer will be prompted to enter that definition.
If you change the work-flow and instead create the destroy migration before removing the code definition,
the destroy migration types can auto-populate the columns and whatnot.

## Roadmap

There are some issues with this framework that need to be [fleshed out](https://github.com/transcend-io/wildebeest/issues/3).
The main issue is that this framework creates many small migrations, which introduces two problems:

1. It can be difficult to understand what the migrations are doing.
2. When multiple people are simultaneously developing, the migration numbers will overlap and the developer will need to re-number the migrations when they rebase to the master branch.

The proposed solution is to split migrations into folders or configurations where each folder is a feature.
The existing `migration-types` would be compiled into a list, and the migration would run by executing all of the migrations in that list,
one by one, in a transaction. The developer would be allowed to add/remove/re-order the migrations within that folder while they develop,
and only once it is pushed to master is when that migration is supposed to stay permanent. This should solve the two issues above because:

1. The migrations can be documented in a feature.
2. Each PR should only have a single migration. This will still mean that the migrations are re-numbered, but one should
   only need to change the number for a single migration folder, not a set of 10 or 20 migration files.

Until this new framework is in place, the current process for re-ordering migrations is as follows:

1. Rebase your branch to master: `git fetch && git rebase -i origin/master`
2. Open `src/migrations/migrations` and find where numbers start to overlap. The server will not start if the ordering is off.
3. Move all of the migrations from the branch you are working onto the end of the migration chain. You can use the command `npm run refactor reorder-migrations`.
4. Wipe your local db and re-run the migrations. You can do this on the `localhost/migrate`
   page or with the command `npm run server:dev:clean && npm run server:dev:uplogs`

Note: Only will work when RUN apk add --no-cache postgresql-client=10.5-r0 is not commented out in app.Dockerfile

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftranscend-io%2Fwildebeest.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftranscend-io%2Fwildebeest?ref=badge_large)
