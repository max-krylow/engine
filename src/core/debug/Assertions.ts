/// <amd-module name="engine/core/debug/Assertions" />

// TODO: Move to environment
const IS_DEBUG: boolean = true;

export function assertIndex(index: number, length: number): void {
   if (!IS_DEBUG) {
      return;
   }
   if (!(index > -1 && index < length)) {
      throw new Error(`Index of enumerable is out of range. Got ${index} for allowable range of ${length} elements.`);
   }
}
