/// <amd-module name="engine/core/utils/Location" />

import Position from "./Position";

/**
 *
 * @file src/core/utils/Location.ts
 */

/**
 *
 */
export default class Location {
   /**
    * Start position.
    */
   public readonly start: Position;
   /**
    * End position.
    */
   public readonly end: Position;

   /**
    * Initialize new instance of location.
    * @param start {Position} Start position.
    * @param end {Position} End position.
    */
   constructor(start: Position, end: Position) {
      this.start = start;
      this.end = end;
   }
}
