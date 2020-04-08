/// <amd-module name="engine/html/TokenizerState" />

/**
 * @file src/html/TokenizerState.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 */

import ContentModel from "./base/ContentModel";

/**
 * Html tokenizer states.
 */
export default class TokenizerState extends ContentModel {
   /// Data content model
   public static readonly TAG_OPEN: number = 4;
   public static readonly END_TAG_OPEN: number = 5;
   public static readonly TAG_NAME: number = 6;
   public static readonly BEFORE_ATTRIBUTE_NAME: number = 7;
   public static readonly ATTRIBUTE_NAME: number = 8;
   public static readonly AFTER_ATTRIBUTE_NAME: number = 9;
   public static readonly BEFORE_ATTRIBUTE_VALUE: number = 10;
   public static readonly ATTRIBUTE_VALUE_DOUBLE_QUOTED: number = 11;
   public static readonly ATTRIBUTE_VALUE_SINGLE_QUOTED: number = 12;
   public static readonly ATTRIBUTE_VALUE_UNQUOTED: number = 13;
   public static readonly AFTER_ATTRIBUTE_VALUE_QUOTED: number = 14;
   public static readonly SELF_CLOSING_START_TAG: number = 15;
   public static readonly BOGUS_COMMENT: number = 16;
   public static readonly BOGUS_COMMENT_HYPHEN: number = 17;
   public static readonly MARKUP_DECLARATION_OPEN: number = 18;
   public static readonly MARKUP_DECLARATION_HYPHEN: number = 19;
   public static readonly MARKUP_DECLARATION_OCTYPE: number = 20;
   public static readonly CDATA_START: number = 21;
   public static readonly COMMENT_START: number = 22;
   public static readonly COMMENT_START_DASH: number = 23;
   public static readonly COMMENT: number = 24;
   public static readonly COMMENT_END_DASH: number = 25;
   public static readonly COMMENT_END: number = 26;
   public static readonly COMMENT_END_BANG: number = 27;
   public static readonly DOCTYPE: number = 28;
   public static readonly CDATA_SECTION: number = 29;
   public static readonly CDATA_RSQB: number = 30;
   public static readonly CDATA_RSQB_RSQB: number = 31;

   /// Raw text content model
   public static readonly RAW_TEXT_LESS_THAN_SIGN: number = 32;
   public static readonly RAW_TEXT_ESCAPE_START: number = 33;
   public static readonly RAW_TEXT_ESCAPE_START_DASH: number = 34;
   public static readonly RAW_TEXT_ESCAPED: number = 35;
   public static readonly RAW_TEXT_ESCAPED_DASH: number = 36;
   public static readonly RAW_TEXT_ESCAPED_DASH_DASH: number = 37;
   public static readonly RAW_TEXT_ESCAPED_LESS_THAN_SIGN: number = 38;
   public static readonly RAW_TEXT_ESCAPED_END_TAG_OPEN: number = 39;
   public static readonly RAW_TEXT_ESCAPED_END_TAG_NAME: number = 40;
   public static readonly RAW_TEXT_DOUBLE_ESCAPE_START: number = 41;
   public static readonly RAW_TEXT_DOUBLE_ESCAPED: number = 42;
   public static readonly RAW_TEXT_DOUBLE_ESCAPED_DASH: number = 43;
   public static readonly RAW_TEXT_DATA_DOUBLE_ESCAPED_DASH_DASH: number = 44;
   public static readonly RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN: number = 45;
   public static readonly RAW_TEXT_DOUBLE_ESCAPE_END: number = 46;

   /// Escapable content model
   public static readonly ESCAPABLE_RAW_TEXT_LESS_THAN_SIGN: number = 47;
   public static readonly ESCAPABLE_RAW_TEXT_END_TAG_NAME: number = 48;
}

