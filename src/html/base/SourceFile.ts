/// <amd-module name="engine/html/base/SourceFile" />

import { assertIndex } from "../../debug/Assertions";
import Characters from "./Characters";

/**
 * @file src/html/base/SourceFile.ts
 */

/**
 * Replace new line sequences with single line feed character.
 * @param text {string} Text.
 * @return {string} Processed text.
 */
function replaceNewLineSequences(text: string): string {
   return text
      .replace(/\n\r/ig, Characters.LINE_FEED)
      .replace(/\r\n/ig, Characters.LINE_FEED);
}

/**
 * Declares methods that operate on text content of file.
 */
export interface ISource {
   /**
    * Get character by index.
    * @param index {number} Character index.
    */
   getChar(index: number): string;

   /**
    * Get source content size.
    * @returns {number} Total characters count in source content.
    */
   getSize(): number;
}

/**
 * Represents methods that operate on text content of file.
 */
export class SourceFile implements ISource {
   /**
    * Source file data.
    * @private
    * @readonly
    */
   private readonly data: string;
   /**
    * Source file path.
    * @private
    * @readonly
    */
   private readonly path: string;

   /**
    * Initialize new instance of source file.
    * @param data {string} Source file data.
    * @param path {string} Source file path.
    */
   constructor(data: string, path: string) {
      this.data = replaceNewLineSequences(data);
      this.path = path;
   }

   /**
    * Get character in source file by index.
    * @param index {number} Character index.
    */
   getChar(index: number): string {
      assertIndex(index, this.data.length);
      return this.data[index];
   }

   /**
    * Get source data size.
    * @returns {number} Count of characters in source file data.
    */
   getSize(): number {
      return this.data.length;
   }

   /**
    * Get source file path.
    * @returns {string} Source file path.
    */
   getPath(): string {
      return this.path;
   }
}

