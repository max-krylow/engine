/// <amd-module name="engine/html/Attributes" />

/**
 * @file src/html/Attributes.ts
 */

import Location from "../core/utils/Location";

/**
 *
 */
export enum AttributeFlag {
   /**
    *
    */
   NONE = 0,
   /**
    *
    */
   ATTRIBUTE = 1,
   /**
    *
    */
   BIND = 2,
   /**
    *
    */
   EVENT_HANDLER = 4
}

/**
 *
 */
const ATTRIBUTE_PREFIX: string = 'attr:';
/**
 *
 */
const BIND_PREFIX: string = 'bind:';
/**
 *
 */
const EVENT_HANDLER_PREFIX: string = 'on:';

/**
 *
 * @param name
 */
function getFlagByAttributeName(name: string): AttributeFlag {
   if (name.startsWith(ATTRIBUTE_PREFIX)) {
      return AttributeFlag.ATTRIBUTE;
   }
   if (name.startsWith(BIND_PREFIX)) {
      return AttributeFlag.BIND;
   }
   if (name.startsWith(EVENT_HANDLER_PREFIX)) {
      return AttributeFlag.EVENT_HANDLER;
   }
   return AttributeFlag.NONE;
}

function getAttributePrefixByFlag(flag: AttributeFlag): string {
   switch (flag) {
      case AttributeFlag.ATTRIBUTE:
         return ATTRIBUTE_PREFIX;
      case AttributeFlag.BIND:
         return BIND_PREFIX;
      case AttributeFlag.EVENT_HANDLER:
         return EVENT_HANDLER_PREFIX;
      default:
         return '';
   }
}

/**
 *
 */
export class AttributeName {
   /**
    *
    */
   readonly name: string;
   /**
    *
    */
   readonly flag: AttributeFlag;

   /**
    *
    * @param name
    */
   constructor(name: string) {
      this.name = name;
      this.flag = getFlagByAttributeName(name);
   }

   /**
    *
    */
   toString(): string {
      return getAttributePrefixByFlag(this.flag) + this.name;
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
   public readonly value: string;
   /**
    *
    */
   public readonly location: Location;

   /**
    *
    * @param name
    * @param value
    * @param location
    */
   constructor(name: AttributeName, value: string | null, location: Location) {
      this.name = name;
      this.value = value;
      this.location = location;
   }

   /**
    *
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
