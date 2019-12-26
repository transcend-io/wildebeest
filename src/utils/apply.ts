// global
import { ObjByString } from '@wildebeest/types';

/**
 * The function to apply
 */
export type ApplyFunc<
  TInput extends ObjByString,
  TOutput,
  TObjType extends TInput
> = (
  value: TInput[keyof TInput],
  key: Extract<keyof TInput, string>,
  fullObj: TObjType,
  index: number,
) => TOutput;

/**
 * Apply a function to each value of an object. Similar to lodash.mapValues but should preserver the typing of the keys.
 *
 * This allows one to define an object keys in an enum and then the resulting map should keep the same typing
 *
 * @param obj - The object to apply the function to
 * @param applyFunc - The function to apply
 * @returns The updated object
 */
export default function apply<TInput extends ObjByString, TOutput>(
  obj: TInput,
  applyFunc: ApplyFunc<TInput, TOutput, typeof obj>,
): { [key in keyof TInput]: TOutput } {
  const result = Object.keys(obj).reduce(
    (acc, key, ind) =>
      Object.assign(acc, {
        [key]: applyFunc(
          obj[key],
          key as Extract<keyof TInput, string>,
          obj,
          ind,
        ),
      }),
    {},
  );
  return result as { [key in keyof TInput]: TOutput };
}
