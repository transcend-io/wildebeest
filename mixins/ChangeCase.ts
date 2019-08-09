// external modules
import camelCase from 'lodash/camelCase';
import pluralize from 'pluralize';

// helpers
import pascalCase from './helpers/pascalCase';

/**
 * A class with all of the casings
 */
export default class ChangeCase {
  /** The word itself (identity function) */
  public plain: string;

  /** Casing for camelCase */
  public camelCase: string;

  /** Casing for pascalCase */
  public pascalCase: string;

  /** Casing for pluralCase */
  public pluralCase: string;

  /** Casing for pascalPluralCase */
  public pascalPluralCase: string;

  /**
   * Create a new case changed
   *
   * @param word - The word to change the case of
   * @param pluralCase - A function that will pluralize a word
   */
  public constructor(
    word: string,
    pluralCase: (word: string) => string = pluralize,
  ) {
    this.plain = word;
    this.camelCase = camelCase(word);
    this.pascalCase = pascalCase(word);
    this.pluralCase = pluralCase(word);
    this.pascalPluralCase = pascalCase(pluralCase(word));
  }
}
