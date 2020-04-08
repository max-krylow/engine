/// <amd-module name="engine/html/base/Symbols" />

/**
 * @file src/html/base/Symbols.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/tokenization.html#tokenization
 */

/**
 * String constants.
 */
export default class Symbols {
   public static readonly NULL: string = '\u0000';
   public static readonly AMPERSAND: string = '&';
   public static readonly LESS_THAN_SIGN: string = '<';
   public static readonly EXCLAMATION_MARK: string = '!';
   public static readonly SOLIDUS: string = '/';
   public static readonly QUESTION_MARK: string = '?';
   public static readonly GREATER_THAN_SIGN: string = '>';
   public static readonly CHARACTER_TABULATION: string = '\t';
   public static readonly LINE_FEED: string = '\n';
   public static readonly FORM_FEED: string = '\f';
   public static readonly SPACE: string = ' ';
   public static readonly QUOTATION_MARK: string = '"';
   public static readonly APOSTROPHE: string = "'";
   public static readonly EQUALS_SIGN: string = '=';
   public static readonly GRAVE_ACCENT: string = '`';
   public static readonly HYPHEN_MINUS: string = '-';
   public static readonly LEFT_SQUARE_BRACKET: string = '[';
   public static readonly RIGHT_SQUARE_BRACKET: string = ']';
}
