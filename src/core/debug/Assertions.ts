/// <amd-module name="engine/core/debug/Assertions" />

// TODO: Move to environment
const IS_DEBUG: boolean = false;

export function assertIndex(index: number, length: number): void {
   if (IS_DEBUG && !(index > -1 && index < length)) {
      throw new Error(`Index of enumerable is out of range. Got ${index} for allowable range of ${length} elements.`);
   }
}
