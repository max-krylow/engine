/// <amd-module name="engine/core/MetaInfo" />

export interface IMetaInfo {
   fileName: string;
}

export class MetaInfo implements IMetaInfo {
   readonly fileName: string;

   constructor(fileName: string) {
      this.fileName = fileName;
   }
}
