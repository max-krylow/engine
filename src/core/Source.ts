/// <amd-module name="engine/core/Source" />

import { assertIndex } from "./debug/Assertions";
import { IMetaInfo } from "./MetaInfo";
import Location from "./utils/Location";
import Symbols from "../html/base/Symbols";

/**
 *
 * @file src/core/Source.ts
 */

/**
 * Null replacement character U+FFFD
 */
const NULL_REPLACEMENT = '\ufffd';

/**
 *
 * @param value
 * @return {string}
 */
function preprocess(value: string): string {
   return value
      .replace(/\n\r/ig, Symbols.LINE_FEED)
      .replace(/\r\n/ig, Symbols.LINE_FEED)
      .replace(/\u0000/ig, NULL_REPLACEMENT);
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

   /**
    *
    */
   getMeta(): IMetaInfo;

   /**
    *
    * @param location
    */
   getSpan(location: Location): string;
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
    */
   private readonly metaInfo: IMetaInfo;

   /**
    *
    * @param data
    * @param metaInfo
    */
   constructor(data: string, metaInfo: IMetaInfo) {
      this.data = preprocess(data);
      this.metaInfo = metaInfo;
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

   /**
    *
    */
   getMeta(): IMetaInfo {
      return this.metaInfo;
   }

   /**
    *
    * @param location
    */
   getSpan(location: Location): string {
      return this.data.slice(location.start.index, location.end.index + 1);
   }
}
