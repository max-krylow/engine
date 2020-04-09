/// <amd-module name="engine/html/base/ContentModel" />

/**
 * @file src/html/base/ContentModel.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 */

/**
 * HTML Element content model.
 */
export enum ContentModel {
   /**
    * Parsable data.
    */
   DATA,
   /**
    * Raw un-escapable text.
    */
   RAW_TEXT,
   /**
    * Raw escapable text.
    */
   ESCAPABLE_RAW_TEXT
}
