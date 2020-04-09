/// <amd-module name="engine/html/NodeDescription" />

/**
 * @file src/html/NodeDescription.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html
 */

import { ContentModel } from "./base/ContentModel";

/**
 *
 */
export interface INodeDescription {
   /**
    *
    */
   readonly closedByParent?: boolean;
   /**
    *
    */
   readonly closedByChildren?: string[];
   /**
    *
    */
   readonly isVoid?: boolean;
   /**
    *
    */
   readonly allowSelfClosing?: boolean;
   /**
    *
    */
   readonly ignoreFirstLF?: boolean;
   /**
    *
    */
   readonly contentModel?: ContentModel;
   /**
    *
    */
   readonly implicitNameSpace?: string | undefined;
}

/**
 *
 */
export class NodeDescription implements INodeDescription {
   readonly closedByChildren: string[];
   readonly closedByParent: boolean;
   readonly isVoid: boolean;
   readonly allowSelfClosing: boolean;
   readonly ignoreFirstLF: boolean;
   readonly contentModel: ContentModel;
   readonly implicitNameSpace: string | undefined;

   /**
    *
    * @param options
    */
   constructor(options: INodeDescription) {
      this.allowSelfClosing = !!options.allowSelfClosing;
      this.closedByChildren = options.closedByChildren || [];
      this.closedByParent = !!options.closedByParent;
      this.ignoreFirstLF = !!options.ignoreFirstLF;
      this.isVoid = !!options.isVoid;
      this.contentModel = options.contentModel || ContentModel.DATA;
      this.implicitNameSpace = options.implicitNameSpace;
   }

   /**
    *
    * @param childElementName
    */
   isClosedByChild(childElementName: string): boolean {
      return this.isVoid || this.closedByChildren.indexOf(childElementName.toUpperCase()) !== -1;
   }
}

/**
 *
 */
const DEFAULT_DEFINITION = new NodeDescription({});

/**
 *
 */
interface INodeDescriptions {
   [elementName: string]: NodeDescription;
}

/**
 *
 */
const NODE_DESCRIPTION: INodeDescriptions = {
   'br': new NodeDescription({
      isVoid: true
   }),
   'script': new NodeDescription({
      contentModel: ContentModel.RAW_TEXT
   }),
   'style': new NodeDescription({
      contentModel: ContentModel.RAW_TEXT
   }),
   'title': new NodeDescription({
      contentModel: ContentModel.ESCAPABLE_RAW_TEXT
   }),
   'textarea': new NodeDescription({
      contentModel: ContentModel.ESCAPABLE_RAW_TEXT,
      ignoreFirstLF: true
   })
};

/**
 *
 * @param name
 */
export function getTagNodeDescription(name: string): NodeDescription {
   if (NODE_DESCRIPTION[name]) {
      return NODE_DESCRIPTION[name];
   }
   return DEFAULT_DEFINITION;
}
