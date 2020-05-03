/**
 * Exponential back-off algorithm https://gist.github.com/kitcambridge/11101250
 *
 * @param localAttempts - Number of attempts so far
 * @param delay - The delay interval
 * @returns The time to wait
 */
export default function getBackoffTime(
  localAttempts: number,
  delay: number,
): number {
  return Math.floor(Math.random() * 2 ** localAttempts * delay);
}
