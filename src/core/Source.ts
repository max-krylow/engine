/// <amd-module name="engine/core/Source" />

import { assertIndex } from "./debug/Assertions";
import Symbols from "../html/base/Symbols";

/**
 *
 * @file src/core/Source.ts
 */

/**
 *
 * @param value
 * @return {string}
 */
function preprocess(value: string): string {
   return value
      .replace(/\n\r/ig, Symbols.LINE_FEED)
      .replace(/\r\n/ig, Symbols.LINE_FEED)
      .replace(/\u0000/ig, Symbols.NULL_REPLACEMENT);
}

/**
 *
 */
export interface ISource {
   /**
    *
    * @param index
    */
   getChar(index: number): string;

   /**
    *
    */
   getSize(): number;
}

/**
 *
 */
export class Source implements ISource {
   /**
    *
    */
   private readonly data: string;

   /**
    *
    * @param data
    */
   constructor(data: string) {
      this.data = preprocess(data);
   }

   /**
    *
    * @param index
    */
   getChar(index: number): string {
      assertIndex(index, this.data.length);
      return this.data[index];
   }

   /**
    *
    */
   getSize(): number {
      return this.data.length;
   }
}
