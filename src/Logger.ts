/* eslint-disable no-console,class-methods-use-this */
// external
/* tslint:disable no-var-requires */
const chalk = require('chalk'); // eslint-disable-line @typescript-eslint/no-var-requires
/* tslint:enable no-var-requires */

const applyChalkColor = (
  color: 'red' | 'green' | 'blue' | 'bold' | 'yellow',
  props: Parameters<typeof console.log>,
): Parameters<typeof console.log> =>
  props.map((p) => (typeof p === 'string' ? chalk[color](p) : p)) as Parameters<
    typeof console.log
  >;

/**
 * The logger can be overwritten with custom logging interfaces, however we require the logger to implement the following
 */
export default class Logger {
  /**
   * Standard console.log
   */
  public log(...props: Parameters<typeof console.log>): void {
    console.log(...props);
  }

  /**
   * Standard console.error
   */
  public error(...props: Parameters<typeof console.log>): void {
    console.error(...applyChalkColor('red', props));
  }

  /**
   * Standard console.warn
   */
  public warn(...props: Parameters<typeof console.log>): void {
    console.warn(...applyChalkColor('yellow', props));
  }

  /**
   * Standard console.info
   */
  public info(...props: Parameters<typeof console.log>): void {
    console.info(...applyChalkColor('blue', props));
  }

  /**
   * Standard console.info
   */
  public debug(...props: Parameters<typeof console.log>): void {
    console.info(...applyChalkColor('green', props));
  }

  /**
   * Print a divider
   */
  public divide(): void {
    this.info('-----------------------------------');
  }
}
