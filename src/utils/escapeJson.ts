import type { ObjByString } from '@wildebeest/types';

/**
 * Escape JSON that may have single quotes in it before inserting into SQL statement
 *
 * @param obj - The object to check
 */
export default function escapeJson<T extends ObjByString>(
  obj: T[] | T,
): string {
  return `cast('${JSON.stringify(obj)
    .split("'")
    .join("' || CHR(39) || '")}' as json)`;
}
