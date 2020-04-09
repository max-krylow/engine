/// <amd-module name="engine/core/utils/Position" />

/**
 *
 * @file src/core/utils/Position.ts
 */

/**
 *
 */
export default class Position {
   /**
    *
    */
   public readonly line: number;
   /**
    *
    */
   public readonly column: number;

   /**
    *
    * @param line
    * @param column
    */
   constructor(line: number, column: number) {
      this.line = line;
      this.column = column;
   }
}
