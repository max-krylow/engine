/// <amd-module name="engine/html/base/ITokenizer" />

import { ContentModel } from "./ContentModel";
import { IAttributes } from "../Attribute";
import Location from "../../core/utils/Location";
import { ISourceReader } from "../../core/SourceReader";

/**
 * @file src/html/base/ITokenizer.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/tokenization.html#tokenization
 */

/**
 * Interface for token handler.
 */
export interface ITokenHandler {
   /**
    *
    * @param tokenizer
    */
   onStart(tokenizer: ITokenizer): void;

   /**
    *
    * @param name
    * @param attributes
    * @param selfClosing
    * @param location
    */
   onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location: Location): void;

   /**
    *
    * @param name
    * @param location
    */
   onCloseTag(name: string, location: Location): void;

   /**
    *
    * @param data
    * @param location
    */
   onText(data: string, location: Location): void;

   /**
    *
    * @param data
    * @param location
    */
   onComment(data: string, location: Location): void;

   /**
    *
    * @param data
    * @param location
    */
   onCDATA(data: string, location: Location): void;

   /**
    *
    * @param data
    * @param location
    */
   onDoctype(data: string, location: Location): void;

   /**
    *
    */
   onEOF(): void;
}

/**
 * Interface for tokenizer.
 */
export interface ITokenizer {
   /**
    * Prepare data before tokenize process without starting.
    */
   start(): void;

   /**
    * Start tokenize process of input source.
    * @param source {ISourceReader} The object that implements the interface ISourceReader
    * and contains data for tokenize process.
    */
   tokenize(source: ISourceReader): void;

   /**
    * Force set content model during the tokenize process.
    * @param contentModel {ContentModel} Content model.
    * @param expectingEndTagName {string} The name of tag which indicates that
    * the tokenizer should go out of this content model state in its previous state.
    */
   setContentModel(contentModel: ContentModel, expectingEndTagName: string): void;
}
