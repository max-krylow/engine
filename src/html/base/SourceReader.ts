/// <amd-module name="engine/html/base/SourceReader" />

import { ISource } from "./SourceFile";
import Characters from "./Characters";

/**
 * @file src/html/base/SourceReader.ts
 */


/**
 * This class represents position in source.
 */
export class SourcePosition {
   /**
    * Zero-based line number in source.
    */
   readonly line: number;
   /**
    * Zero-based column number in source.
    */
   readonly column: number;

   /**
    * Initialize new instance of position in source.
    * @param line {number} Zero-based line number in source.
    * @param column {number} Zero-based column number in source.
    */
   constructor(line: number, column: number) {
      this.line = line;
      this.column = column;
   }
}

/**
 * This class represent zero-based span location in source.
 */
export class SourceLocation {
   /**
    * Zero-based start position of the span in source.
    */
   readonly start: SourcePosition;
   /**
    * Zero-based end position of the span in source.
    */
   readonly end: SourcePosition;

   /**
    * Initialize new instance of location.
    * @param start {SourcePosition} Start position of the span in source.
    * @param end {SourcePosition} End position of the span in source.
    */
   constructor(start: SourcePosition, end: SourcePosition) {
      this.start = start;
      this.end = end;
   }
}

/**
 * End of file constant.
 */
const EOF: null = null;

/**
 * This class declares methods to read source.
 */
export interface ISourceReader {
   /**
    * Consume next character.
    * @returns {string | null} Character or the end of file constant.
    */
   consume(): string | null;

   /**
    * Consume current character again.
    */
   reconsume(): void;

   /**
    * Check if the reader has next character to consume.
    * @returns {boolean} True if the next character can be consumed.
    */
   hasNext(): boolean;

   /**
    * Get current position in the source.
    * @returns {SourcePosition} Zero-based current position in the source.
    */
   getPosition(): SourcePosition;
}

/**
 * This class represents methods to read source.
 */
export class SourceReader implements ISourceReader {
   /**
    * Concrete source.
    * @private
    * @readonly
    */
   private readonly source: ISource;
   /**
    * Current position in source.
    * @private
    */
   private index: number = -1;
   /**
    * Flag whether reader should consume next character.
    * @private
    */
   private reconsumeFlag: boolean = false;
   /**
    * Zero-based line number in source.
    * @private
    */
   private line: number = 0;
   /**
    * Zero-based column number in source.
    * @private
    */
   private column: number = -1;
   /**
    * Flag whether last symbol was line feed.
    * @private
    */
   private lastLF: boolean = false;

   /**
    * Initialize new instance of source reader.
    * @param source {ISource} Concrete source.
    */
   constructor(source: ISource) {
      this.source = source;
   }

   /**
    * Consume next character.
    * @returns {string | null} Character or the end of file constant.
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
    * Consume current character again.
    */
   reconsume(): void {
      if (this.index > -1 && this.index !== this.source.getSize()) {
         this.reconsumeFlag = true;
      }
   }

   /**
    * Check if the reader has next character to consume.
    * @returns {boolean} True if the next character can be consumed.
    */
   hasNext(): boolean {
      if (this.reconsumeFlag) {
         return this.index < this.source.getSize();
      }
      return this.index + 1 < this.source.getSize();
   }

   /**
    * Get current position in the source.
    * @returns {SourcePosition} Zero-based current position in the source.
    */
   getPosition(): SourcePosition {
      return new SourcePosition(this.line, this.column);
   }

   /**
    * Update line and column counters.
    * @param char The last read character.
    * @private
    */
   private updateNavigation(char: string | null): void {
      if (this.lastLF) {
         this.lastLF = false;
         this.column = 0;
         ++this.line;
      }
      if (char === Characters.LINE_FEED) {
         this.lastLF = true;
      }
   }

   /**
    * Move index to the next character in the source.
    * @private
    */
   private moveNext(): void {
      if (this.index < this.source.getSize()) {
         ++this.index;
         ++this.column;
      }
   }

   /**
    * Get current character in the source.
    * @returns {string | null} Character or the end of file constant.
    * @private
    */
   private getChar(): string | null {
      if (this.index < this.source.getSize()) {
         return this.source.getChar(this.index);
      }
      return EOF;
   }
}
