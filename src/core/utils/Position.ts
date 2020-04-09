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
    */
   public readonly index: number;

   /**
    *
    * @param line
    * @param column
    * @param index
    */
   constructor(line: number, column: number, index: number) {
      this.line = line;
      this.column = column;
      this.index = index;
   }
}
