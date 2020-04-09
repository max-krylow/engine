/// <amd-module name="engine/core/MetaInfo" />

/**
 *
 * @file src/core/MetaInfo.ts
 */

/**
 *
 */
export interface IMetaInfo {
   /**
    *
    */
   fileName: string;
}

/**
 *
 */
export class MetaInfo implements IMetaInfo {
   /**
    *
    */
   readonly fileName: string;

   /**
    *
    * @param fileName
    */
   constructor(fileName: string) {
      this.fileName = fileName;
   }
}
