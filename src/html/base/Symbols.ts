/// <amd-module name="engine/html/base/Symbols" />

/**
 * @file src/html/base/Symbols.ts
 */

/**
 * String constants that predominantly used in tokenizer.
 *
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/tokenization.html#tokenization
 */
export default class Symbols {
   /**
    * U+0000 Null representation character.
    */
   public static readonly NULL: string = '\u0000';
   /**
    * U+0026 Ampersand character.
    */
   public static readonly AMPERSAND: string = '&';
   /**
    * U+003C Less that sign character.
    */
   public static readonly LESS_THAN_SIGN: string = '<';
   /**
    * U+0021 Exclamation mark character.
    */
   public static readonly EXCLAMATION_MARK: string = '!';
   /**
    * U+002F Solidus character.
    */
   public static readonly SOLIDUS: string = '/';
   /**
    * U+003F Question mark character.
    */
   public static readonly QUESTION_MARK: string = '?';
   /**
    * U+003E Greater than sign character.
    */
   public static readonly GREATER_THAN_SIGN: string = '>';
   /**
    * U+0009 Character tabulation.
    */
   public static readonly CHARACTER_TABULATION: string = '\t';
   /**
    * U+000A Line feed character.
    */
   public static readonly LINE_FEED: string = '\n';
   /**
    * U+000C Form feed character.
    */
   public static readonly FORM_FEED: string = '\f';
   /**
    * U+0020 Space character.
    */
   public static readonly SPACE: string = ' ';
   /**
    * U+0022 Quotation mark character.
    */
   public static readonly QUOTATION_MARK: string = '"';
   /**
    * U+0027 Apostrophe character.
    */
   public static readonly APOSTROPHE: string = "'";
   /**
    * U+003D Equals sign character.
    */
   public static readonly EQUALS_SIGN: string = '=';
   /**
    * U+0060 Grave accent character.
    */
   public static readonly GRAVE_ACCENT: string = '`';
   /**
    * U+002D Hyphen minus character.
    */
   public static readonly HYPHEN_MINUS: string = '-';
   /**
    * U+005B Left square bracket character.
    */
   public static readonly LEFT_SQUARE_BRACKET: string = '[';
   /**
    * U+005D Right square bracket character.
    */
   public static readonly RIGHT_SQUARE_BRACKET: string = ']';
   /**
    * U+FFFD Null replacement character.
    */
   public static readonly NULL_REPLACEMENT: string = '\ufffd';
}
