/**
 * Escape JSON that may have single quotes in it before inserting into SQL statement
 *
 * @memberof module:utils
 *
 * @param obj - The object to check
 */
export default function escapeJson(obj: {}): string {
  return `cast('${JSON.stringify(obj)
    .split("'")
    .join("' || CHR(39) || '")}}' as json)`;
}
