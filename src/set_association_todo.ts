this.hasMany.forEach((association) => {
  // Default has many should cascade
  const options =
    typeof association === 'object' && association.options
      ? association.options
      : CASCADE_HOOKS;

  // Get the child model
  const childModel = this.db.model(association);
  const associationName = getAssociationAs(association);

  // Has many relation
  this.Model[cases.pascalPluralCase(associationName)] = this.Model.hasMany(
    childModel,
    options,
  );
});

this.hasOne.forEach((association) => {
  // Default has many should cascade
  const options =
    typeof association === 'object' && association.options
      ? association.options
      : CASCADE_HOOKS;

  // Get the child model
  const childModel = this.lookupModel(association);
  const associationName = getAssociationAs(association);

  // Has one child relation
  this.Model[cases.pascalCase(associationName)] = this.Model.hasOne(
    childModel,
    options,
  );
});

this.belongsTo.forEach((association) => {
  // Default has many should cascade
  const options =
    typeof association === 'object' && association.options
      ? association.options
      : NON_NULL;

  // Get the child model
  const parentModel = this.lookupModel(association);
  const associationName = getAssociationAs(association);

  // Belongs to
  this.Model[cases.pascalCase(associationName)] = this.Model.belongsTo(
    parentModel,
    options,
  );
});

this.belongsToMany.forEach((association) => {
  // Determine what the name  of the join table is
  const joinNameOne = `${cases.pascalCase(this.name)}${cases.pascalPluralCase(
    getAssociationAs(association),
  )}` as DatabaseModelName;
  const joinNameTwo = `${cases.pascalCase(
    getAssociationAs(association),
  )}${cases.pascalPluralCase(this.name)}` as DatabaseModelName;

  // No options by default
  const options = {
    through: this.db.model(
      this.db.isDefined(joinNameOne) ? joinNameOne : joinNameTwo,
    ),
    ...(typeof association === 'string' ? {} : association.options),
  };

  // Get the child model
  const associationModel = this.lookupModel(association);
  const associationName = getAssociationAs(association);

  // Belongs to
  this.Model[
    cases.pascalPluralCase(associationName)
  ] = this.Model.belongsToMany(associationModel, options);
});

// Add attributes for belongsTo items
this.belongsTo.forEach((association) => {
  // The column to join on
  const joinOnColumn = getForeignKeyName(association);

  this.modelAttributes[getAssociationColumnName(association)] = Object.assign(
    getAssociationAttribute(
      association,
      // Get the configuration of the attribute to join on
      this.lookupModel(association).getClass().modelAttributes[joinOnColumn],
    ),
    // Default options are to cascade
    {
      isAssociation: true,
      associationOptions:
        association === 'CASCADE'
          ? { onDelete: 'CASCADE' }
          : association.options,
    },
  );
});
