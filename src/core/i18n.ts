/// <amd-module name="engine/core/i18n" />

/**
 * @file src/core/i18n.ts
 */

const EMPTY_STRING = '';

/**
 *
 * @param text
 */
export function splitLocalizationText(text: string): { text: string, context: string } {
   const pair = text.split('@@');
   return {
      text: pair.pop() || EMPTY_STRING,
      context: pair.pop() || EMPTY_STRING
   };
}

export interface IDictionaryItem {
   module: string;
   text: string;
   context: string;
}

export class Dictionary {
   private items: IDictionaryItem[];

   constructor() {
      this.items = [];
   }

   push(module: string, text: string, context: string = EMPTY_STRING) {
      this.items.push({
         module,
         text,
         context
      });
   }
}
