/* eslint-disable no-console,class-methods-use-this */
// external modules
/* tslint:disable no-var-requires */
const chalk = require('chalk'); // eslint-disable-line @typescript-eslint/no-var-requires
/* tslint:enable no-var-requires */

const applyChalkColor = (
  color: 'red' | 'green' | 'blue' | 'bold',
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
   * Standard console.info
   */
  public info(...props: Parameters<typeof console.log>): void {
    console.info(...applyChalkColor('blue', props));
  }

  /**
   * Standard console.info
   */
  public success(...props: Parameters<typeof console.log>): void {
    console.info(...applyChalkColor('green', props));
  }

  /**
   * Standard console.info with bold font
   */
  public header(...props: Parameters<typeof console.log>): void {
    console.info(...applyChalkColor('bold', props));
  }

  /**
   * Print a divider
   */
  public divide(): void {
    this.header('-----------------------------------');
  }
}

/**
 * The default verbose logger does not log anything
 */
export const verboseLoggerDefault: Logger = {
  log: () => null,
  error: () => null,
  info: () => null,
  header: () => null,
  success: () => null,
  divide: () => null,
};
