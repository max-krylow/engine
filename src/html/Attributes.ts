/// <amd-module name="engine/html/Attributes" />

/**
 * @file src/html/Attributes.ts
 */

import Location from "../core/utils/Location";


/**
 *
 */
export class AttributeName {
   /**
    *
    */
   readonly name: string;

   /**
    * Initialize new instance of attribute name.
    * @param name {string} The name of attribute.
    */
   constructor(name: string) {
      this.name = name;
   }

   /**
    * Get string representation of attribute name.
    */
   toString(): string {
      return this.name;
   }
}

/**
 *
 */
export class AttributeValue {
   /**
    *
    */
   public readonly name: AttributeName;
   /**
    *
    */
   public readonly value: string | null;
   /**
    *
    */
   public readonly location: Location;

   /**
    * Initialize new instance of attribute value.
    * @param name {AttributeName} Attribute name.
    * @param value {string | null} Attribute value: string, or null in case of boolean attribute.
    * @param location Attribute value location.
    */
   constructor(name: AttributeName, value: string | null, location: Location) {
      this.name = name;
      this.value = value;
      this.location = location;
   }

   /**
    * Get string representation of attribute value.
    */
   toString(): string {
      if (this.value) {
         return `${this.name}="${this.value}"`;
      }
      return `${this.name}`;
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
