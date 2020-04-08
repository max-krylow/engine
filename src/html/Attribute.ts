/// <amd-module name="engine/html/Attribute" />

import Location from "../core/utils/Location";

/**
 *
 */
export class AttributeValue {
   /**
    *
    */
   public readonly value: string;
   /**
    *
    */
   public readonly location: Location;

   constructor(value: string | null, location: Location) {
      this.value = value;
      this.location = location;
   }
}

/**
 *
 */
export interface IAttributes {
   /**
    *
    */
   [attribute: string]: AttributeValue;
}

