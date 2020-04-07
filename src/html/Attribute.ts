/// <amd-module name="engine/html/Attribute" />

import Location from "../core/utils/Location";

/**
 *
 */
class AttributeValue {
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
interface IAttributes {
   /**
    *
    */
   [attribute: string]: AttributeValue;
}

export {
   AttributeValue,
   IAttributes
};
