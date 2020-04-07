/// <amd-module name="engine/core/Source" />

import { assertIndex } from "./debug/Assertions";
import { IMetaInfo } from "./MetaInfo";

const LINE_FEED = '\n';
const NULL_REPLACEMENT = '\ufffd';

function preprocess(value: string): string {
   return value
      .replace(/\n\r/ig, LINE_FEED)
      .replace(/\r\n/ig, LINE_FEED)
      .replace(/\u0000/ig, NULL_REPLACEMENT);
}

export interface ISource {
   getChar(index: number): string;
   getSize(): number;
   getMeta(): IMetaInfo;
}

export class Source implements ISource {
   private readonly data: string;
   private readonly metaInfo: IMetaInfo;

   constructor(data: string, metaInfo: IMetaInfo) {
      this.data = preprocess(data);
      this.metaInfo = metaInfo;
   }

   getChar(index: number): string {
      assertIndex(index, this.data.length);
      return this.data[index];
   }

   getSize(): number {
      return this.data.length;
   }

   getMeta(): IMetaInfo {
      return this.metaInfo;
   }
}
