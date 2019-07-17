this.hasMany.forEach((association) => {});
  // Get the child model
const childModel = this.db.model(association);
const associationName = getAssociationAs(association);

  // Has many relation
Model[pascalPluralCase(associationName)] = Model.hasMany(childModel, options);
});

this.hasOne.forEach((association) => {
  // Get the child model
  const childModel = this.lookupModel(association);
  const associationName = getAssociationAs(association);

  // Has one child relation
  Model[pascalCase(associationName)] = Model.hasOne(childModel, options);
});

this.belongsTo.forEach((association) => {
  // Get the child model
  const parentModel = this.lookupModel(association);
  const associationName = getAssociationAs(association);

  // Belongs to
  Model[pascalCase(associationName)] = Model.belongsTo(parentModel, options);
});

this.belongsToMany.forEach((association, associationName) => {
  // Get the child model
  const associationModel = this.lookupModel(association);

  // Belongs to
  Model[pascalPluralCase(associationName)] = Model.belongsToMany(
    associationModel,
    options,
  );
});
