/// <amd-module name="engine/html/base/ITokenizer" />

import { ContentModel } from "./ContentModel";
import { IAttributes } from "./Nodes";
import { SourceLocation, ISourceReader } from "./SourceReader";

/**
 * @file src/html/base/ITokenizer.ts
 */

/**
 * Interface for token handler.
 */
export interface ITokenHandler {
   /**
    * Notify about start of tokenize process.
    * @param tokenizer {ITokenizer} Concrete tokenizer implementation.
    */
   onStart(tokenizer: ITokenizer): void;

   /**
    * Emit open tag token.
    * @param name {string} Tag name.
    * @param attributes {IAttributes} Tag attributes.
    * @param selfClosing {boolean} Flag whether tag is self-closing.
    * @param location {SourceLocation} Start and end positions of the tag.
    */
   onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location: SourceLocation): void;

   /**
    * Emit close tag token.
    * @param name {string} Tag name.
    * @param location {SourceLocation} Start and end positions of the tag.
    */
   onCloseTag(name: string, location: SourceLocation): void;

   /**
    * Emit text token.
    * @param data {string} Text data.
    * @param location {SourceLocation} Start and end positions of the text.
    */
   onText(data: string, location: SourceLocation): void;

   /**
    * Emit comment token.
    * @param data {string} Comment data.
    * @param location {SourceLocation} Start and end positions of the comment.
    */
   onComment(data: string, location: SourceLocation): void;

   /**
    * Emit CDATA token.
    * @param data {string} Text data placed inside CDATA section.
    * @param location {SourceLocation} Start and end positions of the CDATA section.
    */
   onCDATA(data: string, location: SourceLocation): void;

   /**
    * Emit doctype token.
    * @param data {string} Text data placed inside doctype declaration.
    * @param location {SourceLocation} Start and end positions of the doctype declaration.
    */
   onDoctype(data: string, location: SourceLocation): void;

   /**
    * Emit end of file token.
    */
   onEOF(): void;
}

/**
 * Interface for tokenizer.
 *
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/tokenization.html#tokenization
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
    * @param expectingEndTagName {string} The name of the tag which indicates that
    * the tokenizer should go out of this content model state in its previous state.
    */
   setContentModel(contentModel: ContentModel, expectingEndTagName: string): void;
}
