/// <amd-module name="engine/html/NodeDescription" />

/**
 * @file src/html/NodeDescription.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html
 * @link http://www.w3.org/TR/html51/syntax.html#optional-tags
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
      return this.isVoid || this.closedByChildren.indexOf(childElementName.toLowerCase()) !== -1;
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
   'base': new NodeDescription({
      isVoid: true
   }),
   'meta': new NodeDescription({
      isVoid: true
   }),
   'area': new NodeDescription({
      isVoid: true
   }),
   'embed': new NodeDescription({
      isVoid: true
   }),
   'link': new NodeDescription({
      isVoid: true
   }),
   'img': new NodeDescription({
      isVoid: true
   }),
   'input': new NodeDescription({
      isVoid: true
   }),
   'param': new NodeDescription({
      isVoid: true
   }),
   'hr': new NodeDescription({
      isVoid: true
   }),
   'br': new NodeDescription({
      isVoid: true
   }),
   'source': new NodeDescription({
      isVoid: true
   }),
   'track': new NodeDescription({
      isVoid: true
   }),
   'wbr': new NodeDescription({
      isVoid: true
   }),
   'p': new NodeDescription({
      closedByChildren: [
         'address', 'article', 'aside',   'blockquote', 'div',  'dl',  'fieldset',
         'footer',  'form',    'h1',      'h2',         'h3',   'h4',  'h5',
         'h6',      'header',  'hgroup',  'hr',         'main', 'nav', 'ol',
         'p',       'pre',     'section', 'table',      'ul'
      ],
      closedByParent: true
   }),
   'thead': new NodeDescription({
      closedByChildren: [
         'tbody', 'tfoot'
      ]
   }),
   'tbody': new NodeDescription({
      closedByChildren: [
         'tbody', 'tfoot'
      ],
      closedByParent: true
   }),
   'tfoot': new NodeDescription({
      closedByChildren: [
         'tbody'
      ],
      closedByParent: true
   }),
   'tr': new NodeDescription({
      closedByChildren: [
         'tr'
      ],
      closedByParent: true
   }),
   'td': new NodeDescription({
      closedByChildren: [
         'td', 'th'
      ],
      closedByParent: true
   }),
   'th': new NodeDescription({
      closedByChildren: [
         'td', 'th'
      ],
      closedByParent: true
   }),
   'col': new NodeDescription({
      isVoid: true
   }),
   'svg': new NodeDescription({
      implicitNameSpace: 'svg'
   }),
   'math': new NodeDescription({
      implicitNameSpace: 'math'
   }),
   'li': new NodeDescription({
      closedByChildren: [
         'li'
      ],
      closedByParent: true
   }),
   'dt': new NodeDescription({
      closedByChildren: [
         'dt', 'dd'
      ]
   }),
   'dd': new NodeDescription({
      closedByChildren: [
         'dt', 'dd'
      ],
      closedByParent: true
   }),
   'rb': new NodeDescription({
      closedByChildren: [
         'rb', 'rt', 'rtc', 'rp'
      ], closedByParent: true
   }),
   'rt': new NodeDescription({
      closedByChildren: [
         'rb', 'rt', 'rtc', 'rp'
      ],
      closedByParent: true
   }),
   'rtc': new NodeDescription({
      closedByChildren: [
         'rb', 'rtc', 'rp'
      ],
      closedByParent: true
   }),
   'rp': new NodeDescription(
      {
         closedByChildren: [
            'rb', 'rt', 'rtc', 'rp'
         ],
         closedByParent: true
      }),
   'optgroup': new NodeDescription({
      closedByChildren: [
         'optgroup'
      ],
      closedByParent: true
   }),
   'option':
      new NodeDescription({
         closedByChildren: [
            'option', 'optgroup'
         ],
         closedByParent: true
      }),
   'pre': new NodeDescription({
      ignoreFirstLF: true
   }),
   'listing': new NodeDescription({
      ignoreFirstLF: true
   }),
   'style': new NodeDescription({
      contentModel: ContentModel.RAW_TEXT
   }),
   'script': new NodeDescription({
      contentModel: ContentModel.RAW_TEXT
   }),
   'title': new NodeDescription({
      contentModel: ContentModel.ESCAPABLE_RAW_TEXT
   }),
   'textarea': new NodeDescription({
      contentModel: ContentModel.ESCAPABLE_RAW_TEXT,
      ignoreFirstLF: true
   }),
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
