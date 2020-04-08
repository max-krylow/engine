/// <amd-module name="engine/html/base/ContentModel" />

/**
 * @file src/html/base/ContentModel.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 */

/**
 * HTML Element content model.
 */
export default abstract class ContentModel {
   /**
    * Parsable data.
    */
   public static readonly DATA: number = 1;
   /**
    * Raw un-escapable text.
    */
   public static readonly RAW_TEXT: number = 2;
   /**
    * Raw escapable text.
    */
   public static readonly ESCAPABLE_RAW_TEXT: number = 3;
}
