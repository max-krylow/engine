/// <amd-module name="engine/core/SourceReader" />

import { ISource } from "./Source";

const EOF: null = null;
const LINE_FEED: string = '\n';

export interface ISourceReader {
   consume(): string | null;
   reconsume(): void;
}

export interface ISourceNavigation {
   getLine(): number;
   getColumn(): number;
}

export class SourceReader implements ISourceReader, ISourceNavigation {
   private readonly source: ISource;
   private index: number;
   private reconsumeFlag: boolean;
   private line: number;
   private column: number;
   private lastLF: boolean;

   constructor(source: ISource) {
      this.source = source;
      this.index = -1;
      this.reconsumeFlag = false;
      this.line = 0;
      this.column = -1;
      this.lastLF = false;
   }

   consume(): string | null {
      if (this.reconsumeFlag) {
         this.reconsumeFlag = false;
         return this.source.getChar(this.index) || EOF;
      }
      if (this.index < this.source.getSize()) {
         ++this.index;
         ++this.column;
      }
      const char = this.source.getChar(this.index) || EOF;
      if (this.lastLF) {
         this.lastLF = false;
         this.column = 0;
         ++this.line;
      }
      if (char === LINE_FEED) {
         this.lastLF = true;
      }
      return char;
   }

   reconsume(): void {
      if (this.index > -1 && this.index < this.source.getSize()) {
         this.reconsumeFlag = true;
      }
   }

   getLine(): number {
      return this.line;
   }

   getColumn(): number {
      return this.column;
   }
}
