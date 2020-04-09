/// <amd-module name="engine/core/SourceReader" />

import { ISource } from "./Source";
import Position from "./utils/Position";
import Symbols from "../html/base/Symbols";

/**
 *
 * @file src/core/SourceReader.ts
 */

/**
 *
 */
const EOF: null = null;

/**
 *
 */
export interface ISourceReader {
   consume(): string | null;
   reconsume(): void;

   /**
    *
    */
   hasNext(): boolean;

   /**
    *
    */
   getPosition(): Position;
}

/**
 *
 */
export class SourceReader implements ISourceReader {
   /**
    *
    */
   private readonly source: ISource;
   /**
    *
    */
   private index: number;
   /**
    *
    */
   private reconsumeFlag: boolean;
   /**
    *
    */
   private line: number;
   /**
    *
    */
   private column: number;
   /**
    *
    */
   private lastLF: boolean;

   /**
    *
    * @param source
    */
   constructor(source: ISource) {
      this.source = source;
      this.index = -1;
      this.reconsumeFlag = false;
      this.line = 0;
      this.column = -1;
      this.lastLF = false;
   }

   /**
    *
    */
   consume(): string | null {
      if (this.reconsumeFlag) {
         this.reconsumeFlag = false;
         return this.getChar();
      }
      this.moveNext();
      const char = this.getChar();
      this.updateNavigation(char);
      return char;
   }

   /**
    *
    */
   reconsume(): void {
      if (this.index > -1 && this.index !== this.source.getSize()) {
         this.reconsumeFlag = true;
      }
   }

   /**
    *
    */
   getPosition(): Position {
      return new Position(this.line, this.column);
   }

   /**
    *
    */
   hasNext(): boolean {
      if (this.reconsumeFlag) {
         return this.index < this.source.getSize();
      }
      return this.index + 1 < this.source.getSize();
   }

   /**
    *
    * @param char
    */
   private updateNavigation(char: string | null): void {
      if (this.lastLF) {
         this.lastLF = false;
         this.column = 0;
         ++this.line;
      }
      if (char === Symbols.LINE_FEED) {
         this.lastLF = true;
      }
   }

   /**
    *
    */
   private moveNext(): void {
      if (this.index < this.source.getSize()) {
         ++this.index;
         ++this.column;
      }
   }

   /**
    *
    */
   private getChar(): string | null {
      if (this.index < this.source.getSize()) {
         return this.source.getChar(this.index);
      }
      return EOF;
   }
}
