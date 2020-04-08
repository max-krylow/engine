/// <amd-module name="engine/core/utils/Location" />

import Position from "./Position";

/**
 *
 */
export default class Location {
   /**
    *
    */
   public readonly start: Position;
   /**
    *
    */
   public readonly end: Position;
   /**
    *
    */
   public readonly index: number;

   /**
    *
    * @param start
    * @param end
    */
   constructor(start: Position, end: Position) {
      this.start = start;
      this.end = end;
   }
}
