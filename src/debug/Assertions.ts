/// <amd-module name="engine/debug/Assertions" />

/**
 *
 * @file src/debug/Assertions.ts
 */

/**
 * Flag for debug mode.
 * @todo Move to environment
 */
const IS_DEBUG: boolean = true;

/**
 * Test that the index enumerable entity is less than permissible size.
 * @param index {number} The index of enumerable entity.
 * @param size {number} The size of enumerable entity.
 */
export function assertIndex(index: number, size: number): void {
   if (!IS_DEBUG) {
      return;
   }
   if (!(index > -1 && index < size)) {
      throw new Error(`Index of enumerable is out of range. Got ${index} for allowable range of ${size} elements.`);
   }
}
