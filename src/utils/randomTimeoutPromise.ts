/**
 * Run a random timeout as a promise
 *
 * @param maxTimeout - The maximum amount of time to wait in ms
 * @throws {module:errors.TimeoutError}
 * @returns Resolves promise
 */
export default async function randomTimeoutPromise(
  maxTimeout: number,
): Promise<number> {
  const timeout = maxTimeout * Math.random();
  return new Promise((resolve) => setTimeout(() => resolve(timeout), timeout));
}
