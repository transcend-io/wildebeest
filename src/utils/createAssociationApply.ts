// global
import {
  BelongsToAssociation,
  HasManyAssociation,
  HasOneAssociation,
  ObjByString,
} from '@wildebeest/types';

// local
import apply, { ApplyFunc } from './apply';

/**
 * Function to apply over associations and enforce
 */
type ApplyFuncForAssociation<TOutputBase> = <
  TInput extends ObjByString,
  TOutput extends TOutputBase
>(
  obj: TInput,
  applyFunc: ApplyFunc<TInput, TOutput, TInput>,
) => { [key in keyof TInput]: TOutput };

/**
 * Apply functions with association
 */
type AssociationApply<TDatabaseModelName extends string> = {
  /** Enforce a belongsTo association */
  belongsTo: ApplyFuncForAssociation<BelongsToAssociation<TDatabaseModelName>>;
  /** Enforce a hasMany association */
  hasMany: ApplyFuncForAssociation<HasManyAssociation<TDatabaseModelName>>;
  /** Enforce a hasOne association */
  hasOne: ApplyFuncForAssociation<HasOneAssociation<TDatabaseModelName>>;
};

/**
 * Creates a new index, main purpose is to override @types/sequelize
 *
 * @returns A set of apply functions that will enforce association types without casting their underlying values
 */
export default function createAssociationApply<
  TDatabaseModelName extends string
>(): AssociationApply<TDatabaseModelName> {
  const asBelongsTo = <
    TBelongsTo extends BelongsToAssociation<TDatabaseModelName>
  >(
    x: TBelongsTo,
  ): TBelongsTo => x;

  const asHasMany = <THasMany extends HasManyAssociation<TDatabaseModelName>>(
    x: THasMany,
  ): THasMany => x;

  const asHasOne = <THasOne extends HasOneAssociation<TDatabaseModelName>>(
    x: THasOne,
  ): THasOne => x;

  return {
    belongsTo: (obj, applyFunc) =>
      apply(obj, (value, key, fullObj, ind) =>
        asBelongsTo(applyFunc(value, key, fullObj, ind)),
      ),
    hasMany: (obj, applyFunc) =>
      apply(obj, (value, key, fullObj, ind) =>
        asHasMany(applyFunc(value, key, fullObj, ind)),
      ),
    hasOne: (obj, applyFunc) =>
      apply(obj, (value, key, fullObj, ind) =>
        asHasOne(applyFunc(value, key, fullObj, ind)),
      ),
  };
}
