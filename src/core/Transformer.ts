/// <amd-module name="engine/core/Transformer" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";
import { IParser, Parser } from '../expression/Parser';

/**
 * @file src/core/Transformer.ts
 */

const EMPTY_STRING = '';

/**
 * Regular expression for finding variables/expression inside of AST
 */
const VARIABLES_PATTERN = /\{\{ ?([\s\S]*?) ?\}\}/g;
const LOCALIZATION_PATTERN = /\{\[ ?([\s\S]*?) ?\]\}/g;

/**
 * Safe replacing
 */
const SAFE_REPLACE_CASE_PATTERN = /\r|\n|\t|\/\*[\s\S]*?\*\//g;

/**
 * Safe whitespaces replacing
 */
const SAFE_WHITESPACE_REMOVE_PATTERN = / +(?= )/g;

interface IAttributesCollection {
   attributes: AstNodes.IAttributes;
   options: AstNodes.IOptions;
   events: AstNodes.IEvents;
}

function isAttribute(name: string): boolean {
   return /^attr:/gi.test(name);
}

function getAttributeName(name: string): string {
   return name.replace(/^attr:/gi, EMPTY_STRING);
}

function isEvent(name: string): boolean {
   return /^on:/gi.test(name);
}

function getEventName(name: string): string {
   return name.replace(/^on:/gi, EMPTY_STRING);
}

function isBind(name: string): boolean {
   return /^bind:/gi.test(name);
}

function getBindName(name: string): string {
   return name.replace(/^bind:/gi, EMPTY_STRING);
}

declare type TWrapper = (text: string) => AstNodes.TText;

function markDataByRegex(
   nodes: AstNodes.TText[],
   regex: RegExp,
   targetWrapper: TWrapper,
   defaultWrapper: TWrapper
): AstNodes.TText[] {
   let item;
   let value;
   let last;
   const data = [];
   for (let idx = 0; idx < nodes.length; ++idx) {
      if (!(nodes[idx] instanceof AstNodes.TextNode)) {
         data.push(nodes[idx]);
         continue;
      }

      const stringData = (nodes[idx] as AstNodes.TextNode).content;

      regex.lastIndex = 0;
      last = 0;
      while ((item = regex.exec(stringData))) {
         if (last < item.index) {
            value = stringData.slice(last, item.index);
            data.push(defaultWrapper(value));
         }
         data.push(targetWrapper(item[1]));
         last = item.index + item[0].length;
      }

      if (last === 0) {
         data.push(nodes[idx]);
      } else if (last < stringData.length) {
         value = stringData.slice(last);
         data.push(defaultWrapper(value));
      }
   }
   return data;
}

function splitLocalizationText(text: string): { text: string, context: string } {
   const pair = text.split('@@');
   return {
      text: pair.pop() || EMPTY_STRING,
      context: pair.pop() || EMPTY_STRING
   };
}

function isComponentName(name: string): boolean {
   return /(\w+[\.:])+\w+/gi.test(name);
}

interface IFilteredAttributes {
   [name: string]: RawNodes.Attribute;
}

function filterAttributes(node: RawNodes.Tag, expected: string[]): IFilteredAttributes {
   const collection: IFilteredAttributes = { };
   for (const attributeName in node.attributes) {
      if (node.attributes.hasOwnProperty(attributeName)) {
         if (expected.indexOf(attributeName) > -1) {
            collection[attributeName] = node.attributes[attributeName];
         } else {
            throw new Error(`Unexpected attribute "${attributeName}" on tag "${node.name}". Ignore this attribute`);
         }
      }
   }
   return collection;
}

function getDataNode(node: RawNodes.Tag, name: string): string {
   const attributes = filterAttributes(node, [name]);
   const data = attributes[name];
   if (data === undefined) {
      throw new Error(`Expected attribute "${name}" on tag "${node.name}". Ignore this tag`);
   }
   if (data.value === null) {
      throw new Error(`Expected attribute "${name}" on tag "${node.name}" has value. Ignore this tag`);
   }
   return data.value;
}

/**
 * Releases transformation from parse tree into abstract syntax tree.
 */
export class TransformVisitor implements RawNodes.IVisitor<any, AstNodes.Ast> {
   expressionParser: IParser;

   /**
    * Initialize new instance of transform visitor.
    */
   constructor() {
      this.expressionParser = new Parser();
   }

   /**
    * Visit all nodes in the given array and generate their ast representation.
    * @param nodes {IVisitable} Collection of nodes.
    * @param context {*} Context.
    */
   visitAll(nodes: RawNodes.IVisitable[], context?: any): any {
      const children = nodes
         .map(node => node.accept(this, context))
         .reduce((acc: any[], cur) => acc.concat(cur), []);
      return children.filter((node: AstNodes.Ast) => node !== undefined);
   }

   /**
    * Visit attribute and generate its ast representation.
    * @param node {Attribute} Attribute node.
    * @param context {*} Context.
    */
   visitAttribute(node: RawNodes.Attribute, context?: any): any {
      return { };
   }

   /**
    * Visit cdata node and generate its ast representation.
    * @param node {CData} CDATA section node.
    * @param context {*} Context.
    */
   visitCData(node: RawNodes.CData, context?: any): any {
      return [new AstNodes.CDataNode(node.value)];
   }

   /**
    * Visit comment node and generate its ast representation.
    * @param node {Comment} Comment node.
    * @param context {*} Context.
    */
   visitComment(node: RawNodes.Comment, context?: any): any {
      return [new AstNodes.CommentNode(node.value)];
   }

   /**
    * Visit doctype node and generate its ast representation.
    * @param node {Doctype} Doctype node.
    * @param context {*} Context.
    */
   visitDoctype(node: RawNodes.Doctype, context?: any): any {
      return [new AstNodes.DoctypeNode(node.value)];
   }

   /**
    * Visit tag node and generate its ast representation.
    * @param node {Tag} Tag node.
    * @param context {*} Context.
    */
   visitTag(node: RawNodes.Tag, context?: any): any {
      switch (node.name) {
         case 'ws:if':
            return this.createIfNode(node, context);
         case 'ws:else':
            return this.createElseNode(node, context);
         case 'ws:for':
            return this.createForNode(node, context);
         case 'ws:foreach':
            return this.createForeachNode(node, context);
         case 'ws:template':
            return this.createTemplateNode(node, context);
         case 'ws:partial':
            return this.createPartialNode(node, context);
         default:
            if (isComponentName(node.name)) {
               return this.createControlNode(node, context);
            }
            return this.createElementNode(node, context);
      }
   }

   /**
    * Visit text node and generate its ast representation.
    * @param node {Text} Text node.
    * @param context {*} Context.
    */
   visitText(node: RawNodes.Text, context?: any): any {
      const value = node.value
         .replace(/(\r|\r\n|\n|\n\r)/gi, '')
         .trim();
      if (value.length === 0) {
         return undefined;
      }
      return this.processTextData(value);
   }

   processTextData(text: string): AstNodes.TText[] {
      SAFE_REPLACE_CASE_PATTERN.lastIndex = 0;
      SAFE_WHITESPACE_REMOVE_PATTERN.lastIndex = 0;

      const originText = text
         .replace(SAFE_REPLACE_CASE_PATTERN, ' ')
         .replace(SAFE_WHITESPACE_REMOVE_PATTERN, EMPTY_STRING);

      const processedText = [new AstNodes.TextNode(originText)];

      const processedExpressions = markDataByRegex(
         processedText,
         VARIABLES_PATTERN,
         (data: string) => new AstNodes.ExpressionNode(this.expressionParser.parse(data)),
         (data: string) => new AstNodes.TextNode(data)
      );

      return markDataByRegex(
         processedExpressions,
         LOCALIZATION_PATTERN,
         (data: string) => {
            const { text, context } = splitLocalizationText(data);
            return new AstNodes.LocalizationNode(text, context);
         },
         (data: string) => new AstNodes.TextNode(data)
      );
   }

   createIfNode(node: RawNodes.Tag, context?: any): AstNodes.IfNode[] {
      const dataNode = getDataNode(node, 'data');
      const test = this.expressionParser.parse(dataNode);
      const consequent = this.visitAll(node.children, context);
      return [new AstNodes.IfNode(test, consequent)];
   }

   createElseNode(node: RawNodes.Tag, context?: any): AstNodes.ElseNode[] {
      let test;
      const { data: dataNode } = filterAttributes(node, ['data']);
      if (dataNode !== undefined) {
         if (dataNode.value !== null) {
            test = this.expressionParser.parse(dataNode.value);
         } else {
            throw new Error(`Expected attribute "data" on tag "${node.name}" has value. Ignore this tag`);
         }
      }
      const consequent = this.visitAll(node.children, context);
      return [new AstNodes.ElseNode(consequent, test)];
   }

   createForNode(node: RawNodes.Tag, context?: any): AstNodes.ForNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForNode(data);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   createForeachNode(node: RawNodes.Tag, context?: any): AstNodes.ForeachNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForeachNode(data);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   createTemplateNode(node: RawNodes.Tag, context?: any): AstNodes.TemplateNode[] {
      const nameNode = getDataNode(node, 'name');
      const ast = new AstNodes.TemplateNode(nameNode);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   visitAttributes(node: RawNodes.Tag, hasAttributesOnly: boolean = false): IAttributesCollection {
      const collection: IAttributesCollection = {
         attributes: { },
         options: { },
         events: { }
      };
      for (const attributeName in node.attributes) {
         if (node.attributes.hasOwnProperty(attributeName)) {
            const value = node.attributes[attributeName].value as string;
            if (isBind(attributeName)) {
               const property = getBindName(attributeName);
               collection.options[property] = new AstNodes.BindNode(property, this.expressionParser.parse(value));
            } else if (isEvent(attributeName)) {
               const event = getEventName(attributeName);
               collection.events[event] = new AstNodes.EventNode(event, this.expressionParser.parse(value));
            } else if (isAttribute(attributeName) || hasAttributesOnly) {
               const attribute = getAttributeName(attributeName);
               const value = node.attributes[attributeName].value as string;
               const processedValue = this.processTextData(value);
               collection.attributes[attribute] = new AstNodes.AttributeNode(attribute, processedValue);
            } else {
               const processedValue = this.processTextData(value);
               collection.options[attributeName] = new AstNodes.AttributeNode(attributeName, processedValue);
            }
         }
      }
      return collection;
   }

   createPartialNode(node: RawNodes.Tag, context?: any): AstNodes.PartialNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      const { template } = options;
      delete options['template'];
      if (template === undefined) {
         throw new Error(`Expected attribute "template" on tag "${node.name}". Ignore this tag`);
      }
      const ast = new AstNodes.PartialNode(node.attributes['template'].value as string, attributes, options, events);
      ast.options['content'] = this.visitAll(node.children, context);
      return [ast];
   }

   createControlNode(node: RawNodes.Tag, context?: any): AstNodes.ControlNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      let ast = new AstNodes.ControlNode(node.name, attributes, options, events);
      ast.options['content'] = this.visitAll(node.children, context);
      return [ast];
   }

   createElementNode(node: RawNodes.Tag, context?: any): AstNodes.ElementNode[] {
      const { attributes, events } = this.visitAttributes(node, true);
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      ast.content = this.visitAll(node.children, context);
      return [ast];
   }
}
