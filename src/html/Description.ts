/// <amd-module name="engine/html/Description" />

/**
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html
 */

import { TokenizerState } from "./Tokenizer";

/**
 *
 */
enum ContentType {
   DATA = TokenizerState.DATA,
   RAW_TEXT = TokenizerState.RAW_TEXT,
   ESCAPABLE_RAW_TEXT= TokenizerState.ESCAPABLE_RAW_TEXT
}

/**
 *
 */
interface INodeDescription {
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
   readonly contentType?: ContentType;
   /**
    *
    */
   readonly implicitNameSpace?: string;
}

/**
 *
 */
class NodeDescription implements INodeDescription {
   readonly allowSelfClosing: boolean;
   readonly closedByChildren: string[];
   readonly closedByParent: boolean;
   readonly ignoreFirstLF: boolean;
   readonly isVoid: boolean;
   readonly contentType: ContentType;
   readonly implicitNameSpace: string;

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
      this.contentType = options.contentType || ContentType.DATA;
      this.implicitNameSpace = options.implicitNameSpace || null;
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
 * @param elementName
 */
function getNodeDescription(elementName: string): INodeDescription {
   return DEFAULT_DEFINITION;
}

export {
   INodeDescription,
   getNodeDescription
};
