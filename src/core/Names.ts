/// <amd-module name="engine/core/Names" />

/**
 * @file src/core/Names.ts
 */

const EMPTY_STRING = '';

/**
 *
 * @param name
 */
export function isAttribute(name: string): boolean {
   return /^attr:/gi.test(name);
}

/**
 *
 * @param name
 */
export function getAttributeName(name: string): string {
   return name.replace(/^attr:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
export function isEvent(name: string): boolean {
   return /^on:/gi.test(name);
}

/**
 *
 * @param name
 */
export function getEventName(name: string): string {
   return name.replace(/^on:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
export function isBind(name: string): boolean {
   return /^bind:/gi.test(name);
}

/**
 *
 * @param name
 */
export function getBindName(name: string): string {
   return name.replace(/^bind:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
export function isComponentName(name: string): boolean {
   return /(\w+[\.:])+\w+/gi.test(name);
}
