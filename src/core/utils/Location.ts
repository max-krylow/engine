/// <amd-module name="engine/core/utils/Location" />

import Position from "./Position";

/**
 * @file src/core/utils/Location.ts
 */

/**
 * This class represent zero-based span location in source file.
 */
export default class Location {
   /**
    * Zero-based start position of the span in source file.
    */
   public readonly start: Position;
   /**
    * Zero-based end position of the span in source file.
    */
   public readonly end: Position;

   /**
    * Initialize new instance of location.
    * @param start {Position} Start position of the span in source file.
    * @param end {Position} End position of the span in source file.
    */
   constructor(start: Position, end: Position) {
      this.start = start;
      this.end = end;
   }
}
