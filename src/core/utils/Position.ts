/// <amd-module name="engine/core/utils/Position" />

/**
 * @file src/core/utils/Position.ts
 */

/**
 * This class represents position in source file.
 */
export default class Position {
   /**
    * Zero-based line number in source file.
    */
   public readonly line: number;
   /**
    * Zero-based column number in source file.
    */
   public readonly column: number;

   /**
    * Initialize new instance of position in source file.
    * @param line {number} Zero-based line number in source file.
    * @param column {number} Zero-based column number in source file.
    */
   constructor(line: number, column: number) {
      this.line = line;
      this.column = column;
   }
}
