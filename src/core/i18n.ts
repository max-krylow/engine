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
   if (pair.length > 2) {
      throw new Error(`Expected only one separator in localization expression. Got ${pair.length - 1}`);
   }
   return {
      text: (pair.pop() || EMPTY_STRING).trim(),
      context: (pair.pop() || EMPTY_STRING).trim()
   };
}

export interface IDictionaryItem {
   module: string;
   text: string;
   context: string;
}

export class Dictionary {
   private readonly items: IDictionaryItem[];

   constructor() {
      this.items = [];
   }

   push(module: string, text: string, context: string = EMPTY_STRING) {
      if (text.trim().length === 0) {
         return;
      }
      this.items.push({
         module,
         text,
         context
      });
   }

   getItems(): IDictionaryItem[] {
      return this.items;
   }
}
