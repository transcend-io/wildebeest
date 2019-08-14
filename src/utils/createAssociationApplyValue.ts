// global
import {
  BelongsToAssociation,
  HasManyAssociation,
  HasOneAssociation,
} from '@wildebeest/types';

// local
import apply from './apply';

/**
 * A typescript enum
 */
type Enum<E> = Record<keyof E, string> &
  ({ [k: number]: string } | { [k: string]: string });

/**
 * The function to apply
 */
type ApplyFunc<TEnumValue extends string, TOutput> = (
  value: TEnumValue,
  key: TEnumValue,
  fullObj: { [k in TEnumValue]: TEnumValue },
  index: number,
) => TOutput;

/**
 * Function to apply over associations and enforce
 */
type ApplyFuncForAssociation<TOutputBase> = <
  TEnumValue extends string,
  TInput extends Enum<TEnumValue>,
  TOutput extends TOutputBase
>(
  obj: TInput,
  applyFunc: ApplyFunc<TEnumValue, TOutput>,
) => { [key in TEnumValue]: TOutput };

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

// Convert the object to be keyed by values
const toEnum = <TEnumValue extends string>(
  enm: Enum<TEnumValue>,
): {
  [key in TEnumValue]: TEnumValue;
} =>
  Object.values(enm).reduce((acc: any, val: any) => {
    acc[val] = val;
    return acc;
  }, {}) as any;

/**
 * Same as `createAssociationApply` except input is enforced to be an enum and the values of the enum are the keys of the created object
 *
 * @returns A set of apply functions that will enforce association types without casting their underlying values
 */
export default function createAssociationApplyValue<
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
    belongsTo: <
      TEnumValue extends string,
      TInput extends Enum<TEnumValue>,
      TOutput extends BelongsToAssociation<TDatabaseModelName>
    >(
      obj: TInput,
      applyFunc: ApplyFunc<TEnumValue, TOutput>,
    ) =>
      apply(toEnum<TEnumValue>(obj), (value, key, fullObj, ind) =>
        asBelongsTo(applyFunc(value, key, fullObj, ind)),
      ),
    hasMany: <
      TEnumValue extends string,
      TInput extends Enum<TEnumValue>,
      TOutput extends HasManyAssociation<TDatabaseModelName>
    >(
      obj: TInput,
      applyFunc: ApplyFunc<TEnumValue, TOutput>,
    ) =>
      apply(toEnum<TEnumValue>(obj), (value, key, fullObj, ind) =>
        asHasMany(applyFunc(value, key, fullObj, ind)),
      ),
    hasOne: <
      TEnumValue extends string,
      TInput extends Enum<TEnumValue>,
      TOutput extends HasManyAssociation<TDatabaseModelName>
    >(
      obj: TInput,
      applyFunc: ApplyFunc<TEnumValue, TOutput>,
    ) =>
      apply(toEnum<TEnumValue>(obj), (value, key, fullObj, ind) =>
        asHasOne(applyFunc(value, key, fullObj, ind)),
      ),
  };
}
