/* eslint-disable no-console,class-methods-use-this */
/**
 *
 * ## Logger
 * An app level logger
 *
 * @module Logger
 * @see module:wildebeest
 */

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
    console.error(...props);
  }

  /**
   * Standard console.info
   */
  public info(...props: Parameters<typeof console.log>): void {
    console.info(...props);
  }
}

/**
 * The default verbose logger does not log anything
 */
export const verboseLoggerDefault = {
  log: () => null,
  error: () => null,
  info: () => null,
};
