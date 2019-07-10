/**
 * Sleep in a promise
 *
 * @memberof module:utils
 *
 * @param sleepTime - The time to sleep
 * @returns Resolves promise
 */
export default function sleepPromise(sleepTime: number): Promise<number> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(sleepTime), sleepTime),
  );
}
